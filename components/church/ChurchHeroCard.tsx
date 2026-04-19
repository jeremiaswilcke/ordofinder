import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Church } from "@/lib/types";

type Props = {
  church: Church;
  locale: string;
};

export async function ChurchHeroCard({ church, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "church" });

  return (
    <section className="grid gap-12 lg:grid-cols-12">
      <div className="flex flex-col justify-center lg:col-span-7">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary">
          {t("historicalSanctuary")} • {church.city}, {church.countryCode}
        </p>
        <h1 className="mt-6 font-headline text-5xl font-bold leading-tight text-primary md:text-7xl">
          {church.name}
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-on-surface-variant">
          {church.description}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <button className="inline-flex items-center gap-3 rounded-lg bg-primary px-8 py-4 font-semibold text-on-primary transition-all hover:brightness-110">
            <span className="material-symbols-outlined">calendar_today</span>
            {t("viewSchedule")}
          </button>
          <button className="border-b-2 border-transparent px-2 py-4 font-semibold text-primary transition-all hover:border-primary">
            {t("supportParish")}
          </button>
        </div>
      </div>
      <div className="relative lg:col-span-5">
        {church.heroImageUrl ? (
          <Image
            src={church.heroImageUrl}
            alt={church.name}
            width={900}
            height={1100}
            className="h-full w-full rounded-xl object-cover grayscale-[0.2]"
          />
        ) : null}
        <div className="absolute -bottom-6 -left-6 max-w-[220px] rounded-lg bg-surface-container-low p-6 shadow-archival">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-outline">
            {t("architectsNote")}
          </p>
          <p className="font-headline text-xl text-primary">
            {church.architecturalStyle?.replaceAll("_", " ")}
          </p>
          {church.consecrationYear || church.capacity ? (
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              {t("consecratedCapacity", {
                year: church.consecrationYear ?? "—",
                capacity: church.capacity?.toLocaleString() ?? "—",
              })}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
