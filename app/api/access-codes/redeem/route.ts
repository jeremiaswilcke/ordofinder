import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { redeemAccessCode } from "@/lib/accessCodes";

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const code = body && typeof body.code === "string" ? body.code : "";
  if (!code.trim()) {
    return NextResponse.json({ error: "code_required" }, { status: 400 });
  }

  try {
    const result = await redeemAccessCode(code, profile.userId);
    return NextResponse.json({ success: true, role: result.role });
  } catch (error) {
    const message = error instanceof Error ? error.message : "redeem_failed";
    const status = message === "code_not_found" || message === "code_invalid_format" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
