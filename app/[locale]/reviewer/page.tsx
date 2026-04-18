import { redirect } from "next/navigation";
import { getCurrentProfile, isReviewerOrHigher } from "@/lib/auth";
import { getModerationQueueForCurrentUser } from "@/lib/moderation";
import { ModerationQueue } from "@/components/moderation/ModerationQueue";
import { signOut } from "@/app/[locale]/(auth)/login/actions";

export default async function ReviewerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/${locale}/login`);
  if (!profile.role) redirect(`/${locale}/apply`);
  if (!isReviewerOrHigher(profile.role)) {
    redirect(`/${locale}`);
  }

  const items = await getModerationQueueForCurrentUser(80);

  const tier1Plus =
    profile.role === "senior_reviewer" ||
    profile.role === "regional_admin" ||
    profile.role === "global_admin";

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-surface-container-low p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
              Reviewer Dashboard
            </p>
            <h1 className="mt-4 font-headline text-5xl text-primary">
              Moderations-Warteschlange
            </h1>
            <p className="mt-4 max-w-2xl text-on-surface-variant">
              Hier siehst du offene Kirchen, Bewertungen und Bewerbungen.
              {tier1Plus
                ? " Als Tier 1+ werden deine Signaturen direkt wirksam."
                : " Als Tier 2 braucht jede Freigabe eine zweite Signatur."}
            </p>
          </div>
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button className="rounded border border-outline/60 bg-surface px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-on-surface hover:border-primary hover:text-primary">
              Abmelden
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Offen" value={items.length} />
        <Stat
          label="Deine Rolle"
          value={profile.role.replace("_", " ")}
          monospace
        />
        <Stat
          label="Konto"
          value={profile.displayName ?? profile.email}
          monospace
        />
      </div>

      <section className="rounded-lg bg-surface-container-low p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          Warteschlange
        </p>
        <div className="mt-4">
          <ModerationQueue
            initialItems={items}
            currentUserId={profile.userId}
            canDecideApplications={tier1Plus}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  monospace,
}: {
  label: string;
  value: string | number;
  monospace?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-container-lowest p-6 shadow-archival">
      <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
        {label}
      </p>
      <p
        className={`mt-3 text-2xl ${monospace ? "font-mono" : "font-headline text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}
