import Link from "next/link";
import type { CityArchive } from "@/lib/types";
import { getChurchBySlug } from "@/lib/demo-data";

export function CityCard({ city, locale }: { city: CityArchive; locale: string }) {
  const featured = getChurchBySlug(city.featuredChurchSlug);

  return (
    <Link href={`/${locale}/city/${city.slug}`} className="group md:col-span-4">
      <article className="flex h-full flex-col justify-between rounded-lg bg-surface-container-low p-8 transition-colors group-hover:bg-surface-container-high">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{city.country}</p>
          <h3 className="mt-3 font-headline text-4xl font-bold text-primary">{city.city}</h3>
          <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">{city.subtitle}</p>
        </div>
        <div className="mt-10 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{city.churchCount} Archives</p>
          <p className="font-headline text-xl text-primary">{featured?.name}</p>
        </div>
      </article>
    </Link>
  );
}
