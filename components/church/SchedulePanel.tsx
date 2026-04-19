import { getTranslations } from "next-intl/server";
import type { Church } from "@/lib/types";

type Props = {
  church: Church;
  locale: string;
};

export async function SchedulePanel({ church, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "schedulePanel" });

  return (
    <section className="grid gap-10 lg:grid-cols-12">
      <div className="rounded-lg bg-surface-container p-12 text-primary lg:col-span-4">
        <h2 className="font-headline text-2xl font-bold italic">
          {t("currentSchedule")}
        </h2>
        <ul className="mt-8 space-y-6">
          {church.masses.slice(0, 4).map((mass) => (
            <li
              key={`${mass.weekday}-${mass.startTime}-${mass.language}`}
              className="flex justify-between border-b border-primary/10 pb-4"
            >
              <span className="text-[10px] uppercase tracking-widest">
                {mass.weekday}
              </span>
              <span className="font-semibold">{mass.startTime}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-8 lg:col-span-8 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h4 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-outline">
              {t("communityHub")}
            </h4>
            <h3 className="font-headline text-2xl font-bold text-on-surface">
              {t("youthEngagement")}
            </h3>
            <p className="mt-4 font-light leading-relaxed text-on-surface-variant">
              {t("communityDescription")}
            </p>
          </div>
          <div className="overflow-hidden rounded-xl shadow-archival">
            <img
              alt={church.name}
              className="aspect-video h-full w-full object-cover"
              src={church.heroImageUrl}
            />
          </div>
        </div>
        <div className="space-y-8 pt-12">
          <div className="overflow-hidden rounded-xl shadow-archival">
            <img
              alt={church.name}
              className="aspect-video h-full w-full object-cover"
              src={church.heroImageUrl}
            />
          </div>
          <div>
            <h4 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-outline">
              {t("silentAdoration")}
            </h4>
            <h3 className="font-headline text-2xl font-bold text-on-surface">
              {t("eucharisticChapel")}
            </h3>
            <p className="mt-4 font-light leading-relaxed text-on-surface-variant">
              {t("adorationDescription")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
