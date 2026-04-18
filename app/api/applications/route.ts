import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentProfile } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reviewerApplicationSchema } from "@/lib/validation/application";

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
  if (profile.role !== null) {
    return NextResponse.json(
      { error: "already_has_role", role: profile.role },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewerApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("reviewer_applications").insert({
    user_id: profile.userId,
    display_name: parsed.data.displayName,
    about: parsed.data.about,
    motivation: parsed.data.motivation,
    preferred_country_code: parsed.data.preferredCountryCode ?? null,
    preferred_subdivision_code: parsed.data.preferredSubdivisionCode ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "application_already_pending" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "insert_failed", details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
