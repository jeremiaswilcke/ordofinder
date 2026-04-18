import { createHash } from "crypto";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InvitePreview = {
  email: string;
  role: "reviewer" | "regional_admin" | "global_admin";
  regionLabel: string;
  status: "valid" | "redeemed" | "expired" | "not_found";
  expiresAt?: string;
};

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function getInvitePreview(token: string): Promise<InvitePreview> {
  if (!hasSupabaseEnv()) {
    return {
      email: "reviewer@ordofinder.archive",
      role: "reviewer",
      regionLabel: "Vienna, AT-9",
      status: "valid",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    };
  }

  const supabase = await createServerSupabaseClient();
  const tokenHash = hashInviteToken(token);
  const { data, error } = await supabase
    .from("invite_tokens")
    .select("email,role,country_code,subdivision_code,redeemed_at,expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return {
      email: "",
      role: "reviewer",
      regionLabel: "No region found",
      status: "not_found",
    };
  }

  const expiresAt = new Date(data.expires_at);
  const now = new Date();
  const status = data.redeemed_at
    ? "redeemed"
    : expiresAt.getTime() < now.getTime()
      ? "expired"
      : "valid";

  return {
    email: data.email,
    role: data.role as InvitePreview["role"],
    regionLabel: data.subdivision_code ?? data.country_code ?? "Global scope",
    status,
    expiresAt: data.expires_at,
  };
}
