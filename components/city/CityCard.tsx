import Link from "next/link";
import type { CityArchive } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getChurchBySlug } from "@/lib/demo-data";

export function CityCard({
  city,
  locale,
  className,
}: {
  city: CityArchive;
  locale: string;
  className?: string;
}) {
  const featured = getChurchBySlug(city.featuredChurchSlug);

  return (
    <Link href={`/${locale}/city/${city.slug}`} className={cn("group md:col-span-4", className)}>
      <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low p-8 transition-colors duration-500 group-hover:bg-surface-container-high group-hover:border-primary/25">
        <div className="archival-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-container/55 to-transparent" />
        <div>
          <p className="relative text-[10px] uppercase tracking-[0.2em] text-outline">{city.country}</p>
          <h3 className="relative mt-3 max-w-[12ch] font-headline text-4xl font-bold text-primary">{city.city}</h3>
          <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">{city.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 border-t border-outline-variant/30 pt-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-outline">{city.churchCount} Archives</p>
            <p className="font-headline text-xl text-primary">{featured?.name}</p>
          </div>
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] text-primary">
            Open Archive
          </span>
        </div>
      </article>
    </Link>
  );
}
