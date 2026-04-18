import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { getCurrentProfile } from "@/lib/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type PendingApp = {
  id: string;
  display_name: string;
  created_at: string;
};

async function getPendingApplication(userId: string): Promise<PendingApp | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = createAdminSupabaseClient();
  const { data } = await supabase
    .from("reviewer_applications")
    .select("id, display_name, created_at")
    .eq("user_id", userId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  return (data as PendingApp | null) ?? null;
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasSupabaseEnv()) {
    return (
      <section className="mx-auto max-w-2xl rounded-lg bg-surface-container-low p-8">
        <h1 className="font-headline text-4xl text-primary">
          Supabase nicht konfiguriert
        </h1>
        <p className="mt-4 text-on-surface-variant">
          Der Bewerbungs-Flow benötigt eine konfigurierte Supabase-Instanz.
        </p>
      </section>
    );
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(`/${locale}/login?mode=signup`);
  }

  if (profile.role) {
    // Rolle vorhanden — Umleitung ins passende Dashboard
    const target =
      profile.role === "global_admin" || profile.role === "regional_admin"
        ? `/${locale}/admin`
        : `/${locale}/reviewer`;
    redirect(target);
  }

  const pending = await getPendingApplication(profile.userId);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-lg bg-surface-container-low p-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          Als Reviewer bewerben
        </p>
        <h1 className="mt-4 font-headline text-5xl text-primary">
          Mach mit beim Archiv.
        </h1>
        <p className="mt-4 max-w-2xl text-on-surface-variant">
          Reviewer tragen Kirchen ein und bewerten sie entlang der vier
          Dimensionen: liturgische Sauberkeit, Musik, Predigt und Lebendigkeit
          des Glaubens. Wir sichten jede Bewerbung persönlich. Die 4-Augen-Pflicht
          sichert die redaktionelle Qualität.
        </p>
      </header>

      {pending ? (
        <section className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            Status
          </p>
          <h2 className="mt-4 font-headline text-3xl text-primary">
            Deine Bewerbung ist in Prüfung.
          </h2>
          <p className="mt-4 text-on-surface-variant">
            Eingereicht am{" "}
            {new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", {
              dateStyle: "long",
            }).format(new Date(pending.created_at))}
            . Du bekommst eine Rückmeldung per E-Mail.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8">
          <ApplicationForm
            defaultDisplayName={profile.displayName ?? ""}
            locale={locale}
            onSuccessHref={`/${locale}/apply`}
          />
        </section>
      )}
    </div>
  );
}
