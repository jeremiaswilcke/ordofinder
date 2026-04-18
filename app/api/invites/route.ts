import { NextResponse } from "next/server";
import { z } from "zod";
import { createInviteToken } from "@/lib/invites";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["reviewer", "regional_admin", "global_admin"]).default("reviewer"),
  countryCode: z.string().trim().min(2).max(2).optional(),
  subdivisionCode: z.string().trim().min(2).max(12).optional(),
  isGlobalScope: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_invite", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await createInviteToken({
      email: parsed.data.email,
      role: parsed.data.role,
      countryCode: parsed.data.countryCode?.toUpperCase(),
      subdivisionCode: parsed.data.subdivisionCode?.toUpperCase(),
      isGlobalScope: parsed.data.isGlobalScope,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invite_creation_failed";
    const status = message === "unauthorized" ? 401 : message === "forbidden_role" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
