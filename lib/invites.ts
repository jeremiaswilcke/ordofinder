import { createHash, randomBytes } from "crypto";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type InvitePreview = {
  email: string;
  role: "reviewer" | "senior_reviewer" | "regional_admin" | "global_admin";
  regionLabel: string;
  status: "valid" | "redeemed" | "expired" | "not_found";
  expiresAt?: string;
};

export type InviteListItem = {
  id: string;
  email: string;
  role: "reviewer" | "senior_reviewer" | "regional_admin" | "global_admin";
  regionLabel: string;
  createdAt: string;
  expiresAt: string;
  redeemedAt: string | null;
};

type InviteRole = InvitePreview["role"];

type CreateInviteInput = {
  email: string;
  role: InviteRole;
  countryCode?: string;
  subdivisionCode?: string;
  isGlobalScope?: boolean;
};

type RedeemInviteInput = {
  token: string;
  password: string;
  displayName: string;
};

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function formatRegionLabel(region: {
  country_code?: string | null;
  subdivision_code?: string | null;
  is_global_scope?: boolean | null;
}) {
  if (region.is_global_scope) {
    return "Global scope";
  }

  return region.subdivision_code ?? region.country_code ?? "No region found";
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

  const supabase = createAdminSupabaseClient();
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
    regionLabel: formatRegionLabel(data),
    status,
    expiresAt: data.expires_at,
  };
}

export async function listInvitesForCurrentUser(): Promise<InviteListItem[]> {
  if (!hasSupabaseEnv()) {
    return [
      {
        id: "demo-invite-1",
        email: "reviewer@ordofinder.archive",
        role: "reviewer",
        regionLabel: "AT-9",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
        redeemedAt: null,
      },
    ];
  }

  const profile = await getCurrentProfile();
  if (!profile?.role) {
    return [];
  }

  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("invite_tokens")
    .select("id,email,role,country_code,subdivision_code,redeemed_at,created_at,expires_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (profile.role !== "global_admin") {
    query = query.eq("invited_by", profile.userId);
  }

  const { data } = await query;

  return (data ?? []).map((invite) => ({
    id: invite.id,
    email: invite.email,
    role: invite.role as InviteRole,
    regionLabel: formatRegionLabel(invite),
    createdAt: invite.created_at,
    expiresAt: invite.expires_at,
    redeemedAt: invite.redeemed_at,
  }));
}

export async function createInviteToken(input: CreateInviteInput) {
  const profile = await getCurrentProfile();
  if (!profile?.role) {
    throw new Error("unauthorized");
  }

  // Gestaffelte Berechtigungen fuer Invites:
  //   reviewer          -> darf nichts einladen
  //   senior_reviewer   -> darf nur reviewer einladen
  //   regional_admin    -> darf reviewer und senior_reviewer einladen
  //   global_admin      -> darf jede Rolle einladen
  if (profile.role === "reviewer") {
    throw new Error("forbidden_role");
  }
  if (profile.role === "senior_reviewer" && input.role !== "reviewer") {
    throw new Error("forbidden_role");
  }
  if (
    profile.role === "regional_admin" &&
    !["reviewer", "senior_reviewer"].includes(input.role)
  ) {
    throw new Error("forbidden_role");
  }

  if (profile.role !== "global_admin" && profile.reviewerInviteQuota <= 0) {
    throw new Error("invite_quota_exhausted");
  }

  const isGlobalScope = profile.role === "global_admin" ? Boolean(input.isGlobalScope) : false;

  if (!isGlobalScope && !input.countryCode && !input.subdivisionCode) {
    throw new Error("region_required");
  }

  const adminSupabase = createAdminSupabaseClient();
  const token = randomBytes(24).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { error } = await adminSupabase.from("invite_tokens").insert({
    token_hash: tokenHash,
    email: input.email.trim().toLowerCase(),
    invited_by: profile.userId,
    role: input.role,
    country_code: isGlobalScope ? null : input.countryCode ?? null,
    subdivision_code: isGlobalScope ? null : input.subdivisionCode ?? null,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (profile.role !== "global_admin") {
    const nextQuota = Math.max(profile.reviewerInviteQuota - 1, 0);
    const { error: quotaError } = await adminSupabase
      .from("profiles")
      .update({ reviewer_invite_quota: nextQuota })
      .eq("id", profile.userId);

    if (quotaError) {
      throw new Error(quotaError.message);
    }
  }

  return {
    token,
    expiresAt,
    regionLabel: isGlobalScope ? "Global scope" : formatRegionLabel({
      country_code: input.countryCode,
      subdivision_code: input.subdivisionCode,
    }),
  };
}

export async function redeemInviteToken(input: RedeemInviteInput) {
  const adminSupabase = createAdminSupabaseClient();
  const tokenHash = hashInviteToken(input.token);
  const { data: invite, error: inviteError } = await adminSupabase
    .from("invite_tokens")
    .select("id,email,role,country_code,subdivision_code,quota_override,redeemed_at,expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (inviteError || !invite) {
    throw new Error("invite_not_found");
  }

  if (invite.redeemed_at) {
    throw new Error("invite_already_redeemed");
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    throw new Error("invite_expired");
  }

  const { data: createdUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
    email: invite.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      display_name: input.displayName,
    },
  });

  if (createUserError || !createdUser.user) {
    throw new Error(createUserError?.message ?? "user_creation_failed");
  }

  const userId = createdUser.user.id;
  const reviewerInviteQuota = invite.quota_override ?? (invite.role === "reviewer" ? 3 : 10);

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      display_name: input.displayName,
      role: invite.role,
      reviewer_invite_quota: reviewerInviteQuota,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const regionInsert =
    invite.role === "global_admin"
      ? { user_id: userId, is_global_scope: true }
      : {
          user_id: userId,
          country_code: invite.country_code,
          subdivision_code: invite.subdivision_code,
          is_global_scope: false,
        };

  const { error: regionError } = await adminSupabase.from("reviewer_regions").insert(regionInsert);
  if (regionError) {
    throw new Error(regionError.message);
  }

  const { error: redeemedError } = await adminSupabase
    .from("invite_tokens")
    .update({
      redeemed_by: userId,
      redeemed_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  if (redeemedError) {
    throw new Error(redeemedError.message);
  }

  return {
    email: invite.email,
    role: invite.role as InviteRole,
  };
}
