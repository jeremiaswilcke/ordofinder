import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentProfile, isReviewerOrHigher } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { confessionTimeSchema } from "@/lib/validation/schedules";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 }
    );
  }
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isReviewerOrHigher(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = confessionTimeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("confession_times")
    .insert({
      church_id: parsed.data.churchId,
      weekday: parsed.data.weekday,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime ?? null,
      language_code: parsed.data.languageCode ?? null,
      notes: parsed.data.notes ?? null,
      created_by: profile.userId,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json(
      { error: "insert_failed", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, id: data.id });
}

export async function DELETE(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 503 }
    );
  }
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!isReviewerOrHigher(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("confession_times").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "delete_failed", details: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true });
}
