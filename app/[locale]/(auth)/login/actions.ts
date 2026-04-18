"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile, type UserRole } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function roleHomeFor(role: UserRole | null, locale: string) {
  switch (role) {
    case "global_admin":
    case "regional_admin":
      return `/${locale}/admin`;
    case "senior_reviewer":
    case "reviewer":
      return `/${locale}/reviewer`;
    default:
      return `/${locale}/apply`;
  }
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (!hasSupabaseEnv()) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return;

  const profile = await getCurrentProfile();
  redirect(roleHomeFor(profile?.role ?? null, locale));
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");

  if (!hasSupabaseEnv()) return;

  const supabase = await createServerSupabaseClient();
  await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  redirect(`/${locale}/apply`);
}

export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  if (!hasSupabaseEnv()) return;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
