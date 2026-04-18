import { getTranslations } from "next-intl/server";
import { UpcomingMasses } from "@/components/city/UpcomingMasses";
import { LocatePrompt } from "@/components/city/LocatePrompt";
import { listChurches } from "@/lib/archive";
import { sortChurchesByDistance } from "@/lib/nearbyChurches";

export default async function NearbyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const lat = sp.lat ? Number(sp.lat) : NaN;
  const lng = sp.lng ? Number(sp.lng) : NaN;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  if (!hasCoords) {
    return <LocatePrompt locale={locale} />;
  }

  const t = await getTranslations({ locale, namespace: "nearby" });
  const churches = await listChurches();
  const nearby = sortChurchesByDistance(
    churches,
    { latitude: lat, longitude: lng },
    { limit: 30, maxKm: 200 }
  );

  return (
    <div className="space-y-10">
      <section className="rounded-lg bg-surface-container-low p-8 md:p-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-headline text-4xl text-primary md:text-6xl">
          {t("headingLocated")}
        </h1>
        <p className="mt-4 max-w-2xl text-on-surface-variant">
          {t("leadLocated", { count: nearby.length })}
        </p>
      </section>

      <UpcomingMasses
        churches={nearby}
        locale={locale}
        cityCenter={{ latitude: lat, longitude: lng }}
        limit={30}
        horizonDays={14}
        heading={t("upcomingHeading")}
        subtitle={t("upcomingSubtitle")}
      />
    </div>
  );
}
