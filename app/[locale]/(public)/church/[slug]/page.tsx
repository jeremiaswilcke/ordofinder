import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ChurchHeroCard } from "@/components/church/ChurchHeroCard";
import { ChurchMetrics } from "@/components/church/ChurchMetrics";
import { SchedulePanel } from "@/components/church/SchedulePanel";
import { findChurch } from "@/lib/archive";
import { getCurrentProfile, isReviewerOrHigher } from "@/lib/auth";

export default async function ChurchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const church = await findChurch(slug);
  if (!church) notFound();

  const profile = await getCurrentProfile();
  const canEditSchedule = isReviewerOrHigher(profile?.role ?? null);
  const [scheduleT, churchT] = await Promise.all([
    getTranslations({ locale, namespace: "schedule" }),
    getTranslations({ locale, namespace: "church" }),
  ]);

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${church.name}, ${church.address}`
  )}`;

  return (
    <div className="space-y-24">
      <ChurchHeroCard church={church} locale={locale} />
      {canEditSchedule && (
        <div className="flex justify-end">
          <Link
            href={`/${locale}/church/${slug}/schedule`}
            className="rounded border border-primary bg-primary/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-on-primary"
          >
            {scheduleT("editLink")}
          </Link>
        </div>
      )}
      <ChurchMetrics church={church} locale={locale} />
      <SchedulePanel church={church} locale={locale} />
      <section className="overflow-hidden rounded-xl bg-surface-container-low shadow-archival md:grid md:grid-cols-2">
        <div>
          <img
            alt={church.name}
            className="h-80 w-full object-cover grayscale opacity-60"
            src="https://images.unsplash.com/photo-1524492449090-ed3f1474f965?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
        <div className="flex flex-col justify-center p-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            {churchT("visitUs")}
          </p>
          <h2 className="mt-4 font-headline text-3xl font-bold text-primary">
            {church.address}
          </h2>
          <p className="mt-6 font-light text-on-surface-variant">
            {church.city} · {church.countryCode} · {church.timezone}
          </p>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="mt-8 self-start rounded bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container transition-all hover:brightness-95"
          >
            {churchT("openInMaps")}
          </a>
        </div>
      </section>
    </div>
  );
}
