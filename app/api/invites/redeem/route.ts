import { NextResponse } from "next/server";
import { z } from "zod";
import { redeemInviteToken } from "@/lib/invites";

const redeemSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
  displayName: z.string().trim().min(2).max(80),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = redeemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_redeem_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await redeemInviteToken(parsed.data);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invite_redeem_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
