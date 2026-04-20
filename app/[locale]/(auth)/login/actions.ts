"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { redeemAccessCode } from "@/lib/accessCodes";
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

function loginUrlWithError(locale: string, error: string, mode?: string) {
  const params = new URLSearchParams({ error });
  if (mode) params.set("mode", mode);
  return `/${locale}/login?${params.toString()}`;
}

async function currentOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (!hasSupabaseEnv()) {
    redirect(loginUrlWithError(locale, "supabase_not_configured"));
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(loginUrlWithError(locale, error.message));
  }

  const profile = await getCurrentProfile();
  redirect(roleHomeFor(profile?.role ?? null, locale));
}

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const accessCode = String(formData.get("accessCode") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");

  if (!hasSupabaseEnv()) {
    redirect(loginUrlWithError(locale, "supabase_not_configured", "signup"));
  }

  const supabase = await createServerSupabaseClient();
  const origin = await currentOrigin();
  const nextPath = accessCode
    ? `/${locale}/redeem?code=${encodeURIComponent(accessCode)}`
    : `/${locale}/apply`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });
  if (error) {
    redirect(loginUrlWithError(locale, error.message, "signup"));
  }

  // Direktes Redeem, wenn wir sofort eine Session haben (Email-Confirm off).
  // Andernfalls traegt die Callback-Route den Code in die Redeem-Seite.
  if (data.session && accessCode && data.user?.id) {
    try {
      await redeemAccessCode(accessCode, data.user.id);
      redirect(`/${locale}/reviewer?activated=1`);
    } catch (redeemError) {
      const message = redeemError instanceof Error ? redeemError.message : "redeem_failed";
      redirect(`/${locale}/redeem?code=${encodeURIComponent(accessCode)}&error=${encodeURIComponent(message)}`);
    }
  }

  if (data.session) {
    redirect(`/${locale}/apply`);
  }
  redirect(`/${locale}/login?mode=signup&info=confirm_email`);
}

export async function signInWithGoogle(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  const accessCode = String(formData.get("accessCode") ?? "").trim();

  if (!hasSupabaseEnv()) {
    redirect(loginUrlWithError(locale, "supabase_not_configured"));
  }

  const nextPath = accessCode
    ? `/${locale}/redeem?code=${encodeURIComponent(accessCode)}`
    : `/${locale}/apply`;

  const supabase = await createServerSupabaseClient();
  const origin = await currentOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data?.url) {
    redirect(loginUrlWithError(locale, error?.message ?? "oauth_failed"));
  }

  redirect(data.url);
}

export async function signOut(formData: FormData) {
  const locale = String(formData.get("locale") ?? "en");
  if (!hasSupabaseEnv()) return;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(`/${locale}`);
}
