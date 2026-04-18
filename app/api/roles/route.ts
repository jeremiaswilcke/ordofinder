import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseEnv } from "@/lib/env";
import { canAssignRole, getCurrentProfile, type UserRole } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  targetUserId: z.string().uuid(),
  newRole: z
    .enum(["reviewer", "senior_reviewer", "regional_admin", "global_admin"])
    .nullable(),
  countryCode: z.string().length(2).regex(/^[A-Z]{2}$/).optional().nullable(),
  subdivisionCode: z.string().min(2).max(10).optional().nullable(),
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

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const desiredRole = parsed.data.newRole as UserRole | null;
  if (!canAssignRole(profile.role, desiredRole)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (parsed.data.targetUserId === profile.userId) {
    return NextResponse.json(
      { error: "cannot_assign_own_role" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  const { error: updErr } = await supabase
    .from("profiles")
    .update({ role: desiredRole })
    .eq("id", parsed.data.targetUserId);

  if (updErr) {
    return NextResponse.json(
      { error: "update_failed", details: updErr.message },
      { status: 500 }
    );
  }

  // Scope eintragen, falls angegeben (z.B. Tier 0 in einem Land)
  if (parsed.data.countryCode || parsed.data.subdivisionCode) {
    const { error: regErr } = await supabase
      .from("reviewer_regions")
      .insert({
        user_id: parsed.data.targetUserId,
        country_code: parsed.data.countryCode ?? null,
        subdivision_code: parsed.data.subdivisionCode ?? null,
        is_global_scope: false,
      });
    if (regErr && regErr.code !== "23505") {
      return NextResponse.json(
        { error: "region_failed", details: regErr.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
