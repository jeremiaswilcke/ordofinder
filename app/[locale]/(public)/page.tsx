import { getTranslations } from "next-intl/server";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { ChurchCard } from "@/components/church/ChurchCard";
import { CityCard } from "@/components/city/CityCard";
import { Button } from "@/components/ui/Button";
import { cities, getChurchBySlug } from "@/lib/demo-data";

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const featuredChurch = getChurchBySlug(cities[0].featuredChurchSlug);

  return (
    <div className="space-y-8">
      <BentoGrid>
        <section className="rounded-lg bg-surface-container-low p-8 md:col-span-8 md:p-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("eyebrow")}</p>
          <h1 className="mt-4 max-w-4xl font-headline text-5xl font-bold text-primary md:text-7xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={`/${locale}/cities`}>{t("ctaPrimary")}</Button>
            <Button href={`/${locale}/map`} variant="secondary">{t("ctaSecondary")}</Button>
          </div>
        </section>
        <aside className="rounded-lg bg-primary p-8 text-on-primary md:col-span-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary/70">{t("detectedCity")}</p>
          <h2 className="mt-3 font-headline text-4xl">Vienna</h2>
          <p className="mt-4 text-sm leading-relaxed text-on-primary/80">{t("featureBody")}</p>
          <div className="mt-10">
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary/70">Featured archive</p>
            <p className="mt-2 font-headline text-2xl">{featuredChurch?.name}</p>
          </div>
        </aside>
      </BentoGrid>

      <section>
        <h2 className="font-headline text-3xl text-primary md:text-5xl">{t("topCities")}</h2>
        <BentoGrid className="mt-6">
          {cities.map((city) => (
            <CityCard key={city.slug} city={city} locale={locale} />
          ))}
        </BentoGrid>
      </section>

      {featuredChurch ? (
        <section>
          <h2 className="font-headline text-3xl text-primary md:text-5xl">{t("featureTitle")}</h2>
          <div className="mt-6">
            <ChurchCard church={featuredChurch} locale={locale} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
