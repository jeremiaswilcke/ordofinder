import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/env";
import { canDecideApplication, getCurrentProfile } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().max(500).optional(),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
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
  if (!canDecideApplication(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Tier 1+ entscheidet direkt (kein 4-Augen). Wir setzen den Status.
  const newStatus = parsed.data.decision === "approve" ? "approved" : "rejected";
  const { error } = await supabase
    .from("reviewer_applications")
    .update({
      status: newStatus,
      decided_by: profile.userId,
      decided_at: new Date().toISOString(),
      decision_note: parsed.data.note ?? null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "update_failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
