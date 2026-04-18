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

  // Nur lokale Pfade akzeptieren — schuetzt vor Open-Redirect:
  //   /foo         -> ok
  //   //evil.com   -> abgewiesen (resolved auf anderer Host)
  //   /\evil.com   -> abgewiesen (Safari/WebKit casing)
  //   javascript:  -> abgewiesen
  //   http(s)://   -> abgewiesen
  const isSafeNext =
    typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    !/^\/+\s*[a-z][a-z0-9+.-]*:/i.test(next);
  const safeNext = isSafeNext ? next : "/";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
