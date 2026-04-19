import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Church } from "@/lib/types";
import { cn, computeNextCelebration, ratingLabelKey, vibrancyLabelKey } from "@/lib/utils";
import { Chip } from "../ui/Chip";
import { VibrancyBadge } from "../ui/VibrancyBadge";

export async function ChurchCard({
  church,
  locale,
  variant = "default",
  className,
}: {
  church: Church;
  locale: string;
  variant?: "default" | "feature";
  className?: string;
}) {
  const nextMass = church.masses[0];
  const isFeature = variant === "feature";

  const [submissionT, ratingsT, vibrancyT, massT] = await Promise.all([
    getTranslations({ locale, namespace: "submission" }),
    getTranslations({ locale, namespace: "ratings" }),
    getTranslations({ locale, namespace: "vibrancy" }),
    getTranslations({ locale, namespace: "mass" }),
  ]);

  const vibrancyLabel = vibrancyT(vibrancyLabelKey(church.ratings.vibrancy) as never);
  const overallLabel = ratingsT(ratingLabelKey(church.ratings.overall) as never);

  let nextLabel: string | null = null;
  if (nextMass) {
    const next = computeNextCelebration(nextMass.startTime);
    nextLabel =
      "minutes" in next ? massT("startsIn", { minutes: next.minutes }) : next.time;
  }

  return (
    <Link
      href={`/${locale}/church/${church.slug}`}
      className={cn("group md:col-span-4", className)}
    >
      <article
        className={cn(
          "overflow-hidden rounded-lg bg-surface-container-lowest shadow-archival",
          isFeature && "grid md:grid-cols-[1.15fr_0.85fr]",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            isFeature ? "aspect-[16/10] min-h-[26rem] md:aspect-auto" : "aspect-[4/5]",
          )}
        >
          {church.heroImageUrl ? (
            <Image
              src={church.heroImageUrl}
              alt={church.name}
              fill
              className="object-cover grayscale-[0.3] transition-transform duration-[7000ms] group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
          {nextLabel ? (
            <div className="absolute left-4 top-4">
              <Chip overlay>{nextLabel}</Chip>
            </div>
          ) : null}
          {isFeature ? (
            <div className="absolute right-4 top-4 rounded bg-black/20 px-4 py-3 text-right text-white backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/65">
                {overallLabel}
              </p>
              <p className="mt-1 font-headline text-3xl">
                {church.ratings.overall.toFixed(1)}/10
              </p>
            </div>
          ) : null}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">
              {church.city}
            </p>
            <h3 className="font-headline text-3xl font-bold">{church.name}</h3>
          </div>
        </div>
        <div
          className={cn(
            "space-y-4 p-6",
            isFeature && "flex flex-col justify-between bg-surface-container-low p-8",
          )}
        >
          {isFeature ? (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                  {church.diocese ?? church.countryCode}
                </p>
                <h3 className="mt-2 font-headline text-4xl text-primary">
                  {church.name}
                </h3>
              </div>
              <p className="text-base leading-relaxed text-on-surface-variant">
                {church.description}
              </p>
            </div>
          ) : null}
          <VibrancyBadge
            value={church.ratings.vibrancy}
            label={vibrancyLabel}
            vibrancyTitle={submissionT("vibrancy")}
          />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {church.shortNote}
          </p>
          {isFeature ? (
            <div className="grid gap-3 border-t border-outline-variant/30 pt-5 md:grid-cols-2">
              <div className="bg-surface-container-lowest p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                  {submissionT("liturgyQuality")}
                </p>
                <p className="mt-2 font-headline text-2xl text-primary">
                  {church.ratings.liturgy.toFixed(1)}
                </p>
              </div>
              <div className="bg-surface-container-lowest p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-outline">
                  {overallLabel}
                </p>
                <p className="mt-2 font-headline text-2xl text-primary">
                  {church.ratings.overall.toFixed(1)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
