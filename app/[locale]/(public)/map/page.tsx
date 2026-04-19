import { getTranslations } from "next-intl/server";
import { ArchiveMap } from "@/components/map/ArchiveMap";

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapPage" });

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
      <ArchiveMap />
    </div>
  );
}
