import { signInWithEmail, signUpWithEmail } from "./actions";

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { locale } = await params;
  const { mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
        {isSignup ? "Neues Reviewer-Konto" : "Login"}
      </p>
      <h1 className="mt-4 font-headline text-5xl text-primary">
        {isSignup ? "Konto anlegen" : "Anmelden"}
      </h1>
      <p className="mt-4 text-on-surface-variant">
        {isSignup
          ? "Registriere dich, um dich anschließend als Reviewer zu bewerben."
          : "Melde dich mit deinem Reviewer-Konto an."}
      </p>

      <form
        action={isSignup ? signUpWithEmail : signInWithEmail}
        className="mt-8 space-y-4"
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

        <button className="w-full rounded bg-primary px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-primary">
          {isSignup ? "Konto anlegen" : "Anmelden"}
        </button>
      </form>

      <div className="mt-6 border-t border-outline-variant/30 pt-6 text-sm text-on-surface-variant">
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
