import { getTranslations } from "next-intl/server";
import { ArchiveMap, type MapMarker } from "@/components/map/ArchiveMap";
import { listChurches } from "@/lib/archive";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [t, churches] = await Promise.all([
    getTranslations({ locale, namespace: "mapPage" }),
    listChurches(),
  ]);

  const markers: MapMarker[] = churches
    .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      city: c.city,
      latitude: c.latitude,
      longitude: c.longitude,
      overall: c.ratings.overall,
    }));

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-headline text-5xl font-bold text-primary md:text-7xl">
          {t("heading")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          {t("description")}
        </p>
      </div>
      <ArchiveMap
        locale={locale}
        markers={markers}
        emptyMessage={t("empty")}
      />
    </div>
  );
}
