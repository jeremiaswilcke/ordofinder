import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createAccessCode, listAccessCodesCreatedBy } from "@/lib/accessCodes";

const ADMIN_ROLES = new Set(["regional_admin", "global_admin"]);

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!profile.role || !ADMIN_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const codes = await listAccessCodesCreatedBy(profile.userId);
  return NextResponse.json({ codes });
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!profile.role || !ADMIN_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const label = typeof body.label === "string" ? body.label.slice(0, 160) : undefined;
  const countryCode =
    typeof body.countryCode === "string" && body.countryCode.trim()
      ? body.countryCode.trim().toUpperCase().slice(0, 2)
      : null;
  const subdivisionCode =
    typeof body.subdivisionCode === "string" && body.subdivisionCode.trim()
      ? body.subdivisionCode.trim().toUpperCase().slice(0, 10)
      : null;
  const maxUsesRaw = body.maxUses;
  const maxUses =
    maxUsesRaw === null || maxUsesRaw === undefined || maxUsesRaw === ""
      ? null
      : Number(maxUsesRaw);
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 10000)) {
    return NextResponse.json({ error: "invalid_max_uses" }, { status: 400 });
  }
  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt ? body.expiresAt : null;

  try {
    const { plain, record } = await createAccessCode({
      createdBy: profile.userId,
      label,
      countryCode,
      subdivisionCode,
      maxUses,
      expiresAt,
    });
    return NextResponse.json({ plain, record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "code_create_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
