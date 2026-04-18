import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { ChurchCard } from "@/components/church/ChurchCard";
import { CityCard } from "@/components/city/CityCard";
import { Button } from "@/components/ui/Button";
import { findChurch, listCities } from "@/lib/archive";

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const cities = await listCities();
  const featuredChurch = cities[0] ? await findChurch(cities[0].featuredChurchSlug) : undefined;
  const topCities = cities.slice(0, 5);
  const archiveCount = cities.reduce((sum, city) => sum + city.churchCount, 0);
  const issueItems = topCities.slice(0, 4);
  const today = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="space-y-10 md:space-y-14">
      <section className="pt-4 md:pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-on-surface pb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
            {t("edition")} · {today}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
            {cities.length} {t("statsCities")} · {archiveCount} {t("statsArchives")}
          </p>
        </div>
        <div className="archival-double-rule py-10 text-center md:py-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">{t("eyebrow")}</p>
          <h1 className="mt-4 font-headline text-[clamp(4rem,9vw,8.25rem)] leading-none tracking-[-0.03em] text-on-surface">
            Ordofinder
          </h1>
          <p className="mt-3 font-headline text-xl italic text-on-surface-variant">{t("tagline")}</p>
        </div>
        <div className="grid gap-10 py-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">{t("editorialNote")}</p>
            <p className="mt-4 max-w-3xl font-headline text-[1.75rem] leading-[1.35] tracking-[-0.01em] text-on-surface">
              {t("opening")}
            </p>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">{t("issueLabel")}</p>
            <div className="mt-3">
              {issueItems.map((city, index) => (
                <div
                  key={city.slug}
                  className={`grid grid-cols-[28px_1fr] gap-3 py-3 ${index === 0 ? "border-t border-on-surface" : "border-t border-outline"}`}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-headline text-lg text-on-surface">{city.city}</p>
                    <p className="text-sm text-on-surface-variant">{city.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-outline">{t("detectedCity")}</p>
            <div className="mt-3 border-t border-on-surface pt-4">
              <h2 className="font-headline text-4xl text-on-surface">Vienna</h2>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{t("cityFeatureBody")}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={`/${locale}/nearby`}>{t("ctaNearby")}</Button>
                <Button href={`/${locale}/cities`} variant="secondary">{t("ctaPrimary")}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BentoGrid className="items-stretch">
        <section className="relative overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest md:col-span-8">
          <div className="archival-grid absolute inset-0 opacity-35" />
          <div className="archival-wash absolute inset-0 opacity-90" />
          <div className="relative grid gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-12">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-outline">{t("eyebrow")}</p>
                <h1 className="mt-4 max-w-4xl font-headline text-5xl font-bold leading-none text-primary md:text-7xl">
                  {t("title")}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-on-surface-variant">{t("subtitle")}</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={`/${locale}/nearby`}>{t("ctaNearby")}</Button>
                <Button href={`/${locale}/cities`} variant="secondary">{t("ctaPrimary")}</Button>
                <Button href={`/${locale}/map`} variant="secondary">{t("ctaSecondary")}</Button>
              </div>
            </div>
            <div className="grid gap-4 self-end">
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("detectedCity")}</p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-4xl text-primary">Vienna</h2>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t("cityFeatureBody")}</p>
                  </div>
                  <span className="rounded bg-primary px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-on-primary">
                    {t("livingArchive")}
                  </span>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded bg-surface-container-low p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("statsCities")}</p>
                  <p className="mt-2 font-headline text-3xl text-primary">{cities.length}</p>
                </div>
                <div className="rounded bg-surface-container-low p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("statsArchives")}</p>
                  <p className="mt-2 font-headline text-3xl text-primary">{archiveCount}</p>
                </div>
                <div className="rounded bg-surface-container-low p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("statsScore")}</p>
                  <p className="mt-2 font-headline text-3xl text-primary">
                    {featuredChurch ? featuredChurch.ratings.overall.toFixed(1) : "9.1"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <aside className="relative overflow-hidden rounded-lg bg-primary md:col-span-4">
          {featuredChurch?.heroImageUrl ? (
            <Image
              src={featuredChurch.heroImageUrl}
              alt={featuredChurch.name}
              fill
              className="object-cover grayscale-[0.35]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative flex min-h-[23rem] flex-col justify-between p-8 text-on-primary">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary/70">{t("featureCardEyebrow")}</p>
              <h2 className="mt-4 max-w-[10ch] font-headline text-4xl">{featuredChurch?.name ?? "Stephansdom"}</h2>
            </div>
            <div>
              <p className="text-sm leading-relaxed text-on-primary/80">{t("featureBody")}</p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-on-primary/70">
                {featuredChurch?.city} · {featuredChurch?.countryCode}
              </p>
            </div>
          </div>
        </aside>
      </BentoGrid>

      <section>
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("cityGridEyebrow")}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-headline text-3xl text-primary md:text-5xl">{t("topCities")}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-on-surface-variant">{t("cityFeatureBody")}</p>
        </div>
        <BentoGrid className="mt-6">
          {topCities.map((city, index) => (
            <CityCard
              key={city.slug}
              city={city}
              locale={locale}
              className={index === 0 ? "md:col-span-6" : index === 1 ? "md:col-span-3" : "md:col-span-3"}
            />
          ))}
        </BentoGrid>
      </section>

      {featuredChurch ? (
        <section>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{t("featureCardEyebrow")}</p>
          <h2 className="mt-3 font-headline text-3xl text-primary md:text-5xl">{t("featureTitle")}</h2>
          <div className="mt-6">
            <ChurchCard church={featuredChurch} locale={locale} variant="feature" className="md:col-span-12" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
