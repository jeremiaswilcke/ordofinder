import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type UserRole =
  | "reviewer"
  | "senior_reviewer"
  | "regional_admin"
  | "global_admin";

export type CurrentProfile = {
  userId: string;
  email: string;
  displayName: string | null;
  role: UserRole | null;
  reviewerInviteQuota: number;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const adminSupabase = createAdminSupabaseClient();
  const { data } = await adminSupabase
    .from("profiles")
    .select("display_name,role,reviewer_invite_quota")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    email: user.email ?? "",
    displayName: data?.display_name ?? null,
    role: (data?.role as UserRole | null) ?? null,
    reviewerInviteQuota: data?.reviewer_invite_quota ?? 0,
  };
});

// ---------------------------------------------------------------------------
// Rollen-Helfer
// ---------------------------------------------------------------------------

const TIER_1_PLUS: UserRole[] = ["senior_reviewer", "regional_admin", "global_admin"];
const REVIEWER_PLUS: UserRole[] = [
  "reviewer",
  "senior_reviewer",
  "regional_admin",
  "global_admin",
];

export function isTier1OrHigher(role: UserRole | null): boolean {
  return role !== null && TIER_1_PLUS.includes(role);
}

export function isReviewerOrHigher(role: UserRole | null): boolean {
  return role !== null && REVIEWER_PLUS.includes(role);
}

export function roleWeight(role: UserRole | null): number {
  switch (role) {
    case "global_admin":
    case "regional_admin":
    case "senior_reviewer":
      return 2;
    case "reviewer":
      return 1;
    default:
      return 0;
  }
}

/**
 * Regeln fuer Rollenzuweisung:
 *   global_admin   -> kann jede Rolle setzen oder entziehen
 *   regional_admin -> reviewer, senior_reviewer in seinem Land; kann keinen
 *                      anderen regional_admin oder global_admin setzen.
 *   senior_reviewer-> reviewer; nichts darueber.
 *   reviewer / null-> nichts.
 */
export function canAssignRole(
  actor: UserRole | null,
  targetNewRole: UserRole | null
): boolean {
  if (!actor) return false;
  if (actor === "global_admin") return true;

  if (actor === "regional_admin") {
    return (
      targetNewRole === null ||
      targetNewRole === "reviewer" ||
      targetNewRole === "senior_reviewer"
    );
  }

  if (actor === "senior_reviewer") {
    return targetNewRole === null || targetNewRole === "reviewer";
  }

  return false;
}

/**
 * Wer darf eine Bewerbung entscheiden? Tier 1+ reicht (Senior-Reviewer, Laender-
 * und Global-Admin). Grund: bei Tier 1+ gilt kein 4-Augen-Prinzip, also ist die
 * Entscheidung sofort wirksam.
 */
export function canDecideApplication(actor: UserRole | null): boolean {
  return isTier1OrHigher(actor);
}

/**
 * Wer darf eine Signatur im Moderationsprozess abgeben? Tier 2+ (Reviewer und
 * alle darueber). Das Gewicht wird von der Gewichtsfunktion bestimmt.
 */
export function canSignModeration(actor: UserRole | null): boolean {
  return isReviewerOrHigher(actor);
}
