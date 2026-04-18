import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
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

  const [t, items] = await Promise.all([
    getTranslations({ locale, namespace: "reviewer" }),
    getModerationQueueForCurrentUser(80),
  ]);

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
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 font-headline text-5xl text-primary">
              {t("heading")}
            </h1>
            <p className="mt-4 max-w-2xl text-on-surface-variant">
              {tier1Plus ? t("leadTier1") : t("leadTier2")}
            </p>
          </div>
          <form action={signOut}>
            <input type="hidden" name="locale" value={locale} />
            <button className="rounded border border-outline/60 bg-surface px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-on-surface hover:border-primary hover:text-primary">
              {t("signOut")}
            </button>
          </form>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label={t("statOpen")} value={items.length} />
        <Stat
          label={t("statRole")}
          value={profile.role.replace("_", " ")}
          monospace
        />
        <Stat
          label={t("statAccount")}
          value={profile.displayName ?? profile.email}
          monospace
        />
      </div>

      <section className="rounded-lg bg-surface-container-low p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("queueTitle")}
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
