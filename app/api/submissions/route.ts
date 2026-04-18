import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { churchSubmissionSchema } from "@/lib/validation/submission";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = churchSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_submission", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json({
      success: true,
      mode: "local-fallback",
      message: "Submission validated locally. Configure Supabase to persist it.",
    });
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("church_submissions").insert({
    church_name: parsed.data.churchName,
    city: parsed.data.city,
    country_code: parsed.data.countryCode,
    timezone: parsed.data.timezone,
    payload: parsed.data,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: "submission_failed", details: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
