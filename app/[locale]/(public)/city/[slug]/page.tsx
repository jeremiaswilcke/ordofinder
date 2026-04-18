import { notFound } from "next/navigation";
import { BentoGrid } from "@/components/layout/BentoGrid";
import { ChurchCard } from "@/components/church/ChurchCard";
import { getChurchesByCity, getCityBySlug } from "@/lib/demo-data";

export default async function CityDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();
  const cityChurches = getChurchesByCity(slug);

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-surface-container-low p-8 md:p-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{city.country}</p>
        <h1 className="mt-4 font-headline text-5xl font-bold text-primary md:text-7xl">{city.city}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-on-surface-variant">{city.subtitle}</p>
      </section>
      <BentoGrid>
        {cityChurches.map((church) => (
          <ChurchCard key={church.slug} church={church} locale={locale} />
        ))}
      </BentoGrid>
    </div>
  );
}
