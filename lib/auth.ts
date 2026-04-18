import { cache } from "react";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  userId: string;
  email: string;
  displayName: string | null;
  role: "reviewer" | "regional_admin" | "global_admin" | null;
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
    role: (data?.role as CurrentProfile["role"]) ?? null,
    reviewerInviteQuota: data?.reviewer_invite_quota ?? 0,
  };
});
