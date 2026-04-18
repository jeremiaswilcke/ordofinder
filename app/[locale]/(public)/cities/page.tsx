import { getTranslations } from "next-intl/server";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { CityCard } from "@/components/city/CityCard";
import { Icon } from "@/components/ui/Icon";
import { listCities } from "@/lib/archive";

export default async function CitiesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cities" });
  const cities = await listCities();

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <h1 className="font-headline text-5xl font-bold text-primary md:text-7xl">{t("title")}</h1>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{t("subtitle")}</p>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-surface-container-low px-4 py-4">
        <Icon name="search" className="text-primary" />
        <input
          className="w-full border-none bg-transparent p-0 text-sm text-on-surface focus:ring-0"
          placeholder={t("searchPlaceholder")}
        />
      </div>
      <BentoGrid>
        {cities.map((city) => (
          <CityCard key={city.slug} city={city} locale={locale} />
        ))}
      </BentoGrid>
    </div>
  );
}
