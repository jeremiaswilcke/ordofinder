import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const next = url.searchParams.get("next") ?? "/en/apply";

  if (error) {
    const redirectUrl = new URL("/en/login", url.origin);
    redirectUrl.searchParams.set(
      "error",
      errorDescription ?? error ?? "oauth_failed"
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    const redirectUrl = new URL("/en/login", url.origin);
    redirectUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    const redirectUrl = new URL("/en/login", url.origin);
    redirectUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(redirectUrl);
  }

  const safeNext = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
