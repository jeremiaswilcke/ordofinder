import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "./actions";

const ERROR_LABELS: Record<string, string> = {
  supabase_not_configured:
    "Supabase ist nicht konfiguriert. Bitte Admin kontaktieren.",
  missing_code: "OAuth-Code fehlt. Bitte erneut versuchen.",
  oauth_failed: "Google-Login fehlgeschlagen. Bitte erneut versuchen.",
  "Invalid login credentials":
    "E-Mail oder Passwort stimmen nicht. Noch kein Konto? Jetzt anlegen.",
  "Email not confirmed":
    "Bitte bestätige deine E-Mail (Postfach prüfen), dann melde dich an.",
  "User already registered":
    "E-Mail bereits registriert. Melde dich stattdessen an.",
};

function labelFor(raw?: string): string | null {
  if (!raw) return null;
  return ERROR_LABELS[raw] ?? raw;
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string; error?: string; info?: string }>;
}) {
  const { locale } = await params;
  const { mode, error, info } = await searchParams;
  const isSignup = mode === "signup";
  const errorLabel = labelFor(error);

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-lg bg-surface-container-low p-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {isSignup ? "Neues Konto" : "Login"}
        </p>
        <h1 className="mt-4 font-headline text-5xl text-primary">
          {isSignup ? "Konto anlegen" : "Anmelden"}
        </h1>
        <p className="mt-4 text-on-surface-variant">
          {isSignup
            ? "Registriere dich, um dich anschließend als Reviewer zu bewerben."
            : "Melde dich mit deinem Reviewer-Konto an."}
        </p>
      </div>

      {errorLabel && (
        <div className="rounded-lg border border-error/40 bg-error-container px-4 py-3 text-sm text-on-error-container">
          {errorLabel}
        </div>
      )}
      {info === "confirm_email" && (
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
          Konto angelegt. Prüfe dein Postfach und bestätige die E-Mail, dann
          kannst du dich anmelden.
        </div>
      )}

      <form action={signInWithGoogle} className="">
        <input type="hidden" name="locale" value={locale} />
        <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary">
          <GoogleMark />
          {isSignup ? "Mit Google anlegen" : "Mit Google anmelden"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-outline">
        <span className="h-px flex-1 bg-outline-variant/40" />
        oder
        <span className="h-px flex-1 bg-outline-variant/40" />
      </div>

      <form
        action={isSignup ? signUpWithEmail : signInWithEmail}
        className="space-y-4"
      >
        <input type="hidden" name="locale" value={locale} />

        {isSignup && (
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
              Anzeigename
            </label>
            <input
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
              placeholder="Max Mustermann"
              name="displayName"
              required
              minLength={2}
              maxLength={120}
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            E-Mail
          </label>
          <input
            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
            placeholder="name@example.com"
            name="email"
            type="email"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-outline">
            Passwort
          </label>
          <input
            className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-3"
            type="password"
            placeholder="•••••••"
            name="password"
            required
            minLength={8}
          />
        </div>

        <button className="w-full rounded bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary transition hover:bg-primary-dim">
          {isSignup ? "Konto anlegen" : "Anmelden"}
        </button>
      </form>

      <div className="border-t border-outline-variant/30 pt-6 text-sm text-on-surface-variant">
        {isSignup ? (
          <>
            Schon ein Konto?{" "}
            <a
              href={`/${locale}/login`}
              className="text-primary hover:underline"
            >
              Anmelden
            </a>
          </>
        ) : (
          <>
            Noch kein Konto?{" "}
            <a
              href={`/${locale}/login?mode=signup`}
              className="text-primary hover:underline"
            >
              Konto anlegen und bewerben
            </a>
          </>
        )}
      </div>
    </section>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.468-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.334z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
