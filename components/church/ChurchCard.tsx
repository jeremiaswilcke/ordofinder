import Image from "next/image";
import Link from "next/link";
import type { Church } from "@/lib/types";
import { computeNextCelebration } from "@/lib/utils";
import { Chip } from "../ui/Chip";
import { VibrancyBadge } from "../ui/VibrancyBadge";

export function ChurchCard({ church, locale }: { church: Church; locale: string }) {
  const nextMass = church.masses[0];

  return (
    <Link href={`/${locale}/church/${church.slug}`} className="group md:col-span-4">
      <article className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-archival">
        <div className="relative aspect-[4/5] overflow-hidden">
          {church.heroImageUrl ? (
            <Image
              src={church.heroImageUrl}
              alt={church.name}
              fill
              className="object-cover grayscale-[0.3] transition-transform duration-[7000ms] group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          <div className="absolute left-4 top-4">
            <Chip overlay>{computeNextCelebration(nextMass.startTime)}</Chip>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">{church.city}</p>
            <h3 className="font-headline text-3xl font-bold">{church.name}</h3>
          </div>
        </div>
        <div className="space-y-4 p-6">
          <VibrancyBadge value={church.ratings.vibrancy} />
          <p className="text-sm leading-relaxed text-on-surface-variant">{church.shortNote}</p>
        </div>
      </article>
    </Link>
  );
}
