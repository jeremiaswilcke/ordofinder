import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { ChurchCard } from "@/components/church/ChurchCard";
import { UpcomingMasses } from "@/components/city/UpcomingMasses";
import { findCity, listChurchesByCity } from "@/lib/archive";

const RECOMMENDATION_THRESHOLD = 7.5;

export default async function CityDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const city = await findCity(slug);
  if (!city) notFound();
  const cityChurches = await listChurchesByCity(slug);
  const t = await getTranslations({ locale, namespace: "city" });

  const sorted = [...cityChurches].sort(
    (a, b) => b.ratings.overall - a.ratings.overall
  );
  const recommended = sorted.filter(
    (c) => c.ratings.overall >= RECOMMENDATION_THRESHOLD
  );
  const also = sorted.filter(
    (c) => c.ratings.overall < RECOMMENDATION_THRESHOLD
  );

  return (
    <div className="space-y-10">
      <section className="rounded-lg bg-surface-container-low p-8 md:p-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{city.country}</p>
        <h1 className="mt-4 font-headline text-5xl font-bold text-primary md:text-7xl">{city.city}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">{city.subtitle}</p>
      </section>

      <UpcomingMasses churches={cityChurches} locale={locale} />

      {recommended.length > 0 && (
        <section className="space-y-4">
          <header className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                {t("recommendedEyebrow")}
              </p>
              <h2 className="mt-2 font-headline text-3xl text-primary md:text-4xl">
                {t("recommendedHeading")}
              </h2>
            </div>
            <span className="text-xs uppercase tracking-[0.16em] text-outline">
              {t("recommendedCount", { count: recommended.length })}
            </span>
          </header>
          <BentoGrid>
            {recommended.map((church) => (
              <ChurchCard key={church.slug} church={church} locale={locale} />
            ))}
          </BentoGrid>
        </section>
      )}

      {also.length > 0 && (
        <section className="space-y-4">
          <header>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
              {t("alsoEyebrow")}
            </p>
            <h2 className="mt-2 font-headline text-2xl text-on-surface md:text-3xl">
              {t("alsoHeading")}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
              {t("alsoSubtitle")}
            </p>
          </header>
          <BentoGrid className="opacity-85">
            {also.map((church) => (
              <ChurchCard key={church.slug} church={church} locale={locale} />
            ))}
          </BentoGrid>
        </section>
      )}

      {recommended.length === 0 && also.length === 0 && (
        <p className="text-sm text-on-surface-variant">{t("empty")}</p>
      )}
    </div>
  );
}
