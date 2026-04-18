import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/env";
import { canSignModeration, getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  targetType: z.enum(["church", "rating", "application"]),
  targetId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 }
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (!canSignModeration(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  // RLS-Policy blockiert Self-Approval und unberechtigte Rollen. Zusaetzlich
  // blockiert der Unique-Constraint Mehrfach-Signaturen desselben Actors.
  const { error } = await supabase.from("moderation_actions").insert({
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    actor_id: profile.userId,
    action: parsed.data.action,
    note: parsed.data.note ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "already_signed" },
        { status: 409 }
      );
    }
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "forbidden_by_policy" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: "insert_failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
