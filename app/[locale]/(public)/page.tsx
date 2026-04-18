import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ChurchCard } from "@/components/church/ChurchCard";
import { CityCard } from "@/components/city/CityCard";
import { Button } from "@/components/ui/Button";
import { findChurch, listChurches, listCities } from "@/lib/archive";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const cities = await listCities();
  const churches = await listChurches();
  const topCities = cities.slice(0, 8);
  const featuredChurchSlug = cities[0]?.featuredChurchSlug;
  const featuredChurch = featuredChurchSlug
    ? await findChurch(featuredChurchSlug)
    : undefined;

  return (
    <div className="space-y-16 md:space-y-20">
      {/* Hero — kompakt, funktional */}
      <section className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-6 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-headline text-4xl leading-[1.05] tracking-[-0.01em] text-primary md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-lg">
          {t("subtitle")}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={`/${locale}/nearby`}>{t("ctaNearby")}</Button>
          <Button href={`/${locale}/cities`} variant="secondary">
            {t("ctaPrimary")}
          </Button>
          <Button href={`/${locale}/map`} variant="secondary">
            {t("ctaSecondary")}
          </Button>
        </div>

        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-outline-variant/30 pt-6 md:max-w-xl">
          <Stat label={t("statsCities")} value={cities.length} />
          <Stat label={t("statsArchives")} value={churches.length} />
          <Stat
            label={t("statsScore")}
            value={
              churches.length > 0
                ? (
                    churches.reduce(
                      (sum, c) => sum + (c.ratings.overall ?? 0),
                      0
                    ) / churches.length
                  ).toFixed(1)
                : "—"
            }
          />
        </dl>
      </section>

      {/* Stadt-Katalog */}
      <section>
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-outline-variant/30 pb-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
              {t("cityGridEyebrow")}
            </p>
            <h2 className="mt-2 font-headline text-2xl text-primary md:text-3xl">
              {t("topCities")}
            </h2>
          </div>
          <a
            href={`/${locale}/cities`}
            className="text-sm uppercase tracking-[0.18em] text-primary hover:underline"
          >
            {t("ctaPrimary")} →
          </a>
        </header>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
          {topCities.map((city, index) => (
            <CityCard
              key={city.slug}
              city={city}
              locale={locale}
              className={
                index === 0
                  ? "md:col-span-6"
                  : index < 3
                    ? "md:col-span-3"
                    : "md:col-span-3"
              }
            />
          ))}
        </div>
      </section>

      {/* Featured Kirche */}
      {featuredChurch && (
        <section>
          <header className="border-b border-outline-variant/30 pb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
              {t("featureCardEyebrow")}
            </p>
            <h2 className="mt-2 font-headline text-2xl text-primary md:text-3xl">
              {featuredChurch.name}
            </h2>
          </header>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">
            <ChurchCard
              church={featuredChurch}
              locale={locale}
              variant="feature"
              className="md:col-span-12"
            />
          </div>
        </section>
      )}

      {/* Mitmachen */}
      <section className="grid gap-6 rounded-lg border border-outline-variant/30 bg-surface-container-low p-6 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
            {t("contributeEyebrow")}
          </p>
          <h2 className="mt-3 font-headline text-2xl text-primary md:text-3xl">
            {t("contributeHeading")}
          </h2>
          <p className="mt-4 max-w-xl text-on-surface-variant">
            {t("contributeBody")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={`/${locale}/login?mode=signup`}>
              {t("contributeCta")}
            </Button>
            <Button href={`/${locale}/login`} variant="secondary">
              {t("login")}
            </Button>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded md:block">
          {featuredChurch?.heroImageUrl ? (
            <Image
              src={featuredChurch.heroImageUrl}
              alt={featuredChurch.name}
              fill
              className="object-cover grayscale-[0.35]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent" />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-outline">
        {label}
      </dt>
      <dd className="mt-1 font-headline text-2xl text-primary md:text-3xl">
        {value}
      </dd>
    </div>
  );
}
