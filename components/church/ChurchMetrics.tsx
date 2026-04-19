import { getTranslations } from "next-intl/server";
import type { Church } from "@/lib/types";
import { ratingLabelKey } from "@/lib/utils";
import { MetricCard } from "../ui/MetricCard";

type Props = {
  church: Church;
  locale: string;
};

export async function ChurchMetrics({ church, locale }: Props) {
  const [m, submission, ratings] = await Promise.all([
    getTranslations({ locale, namespace: "churchMetrics" }),
    getTranslations({ locale, namespace: "submission" }),
    getTranslations({ locale, namespace: "ratings" }),
  ]);

  const label = (value: number) =>
    ratings(ratingLabelKey(value) as never);

  return (
    <section>
      <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant/20 pb-4">
        <h2 className="font-headline text-3xl font-bold text-primary">
          {m("heading")}
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-outline">
          {m("subtitle")}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon="auto_awesome"
          title={submission("liturgyQuality")}
          description={m("liturgyDescription")}
          value={church.ratings.liturgy}
          label={label(church.ratings.liturgy)}
        />
        <MetricCard
          icon="library_music"
          title={submission("music")}
          description={m("musicDescription")}
          value={church.ratings.music}
          label={label(church.ratings.music)}
        />
        <MetricCard
          icon="local_library"
          title={submission("homilyClarity")}
          description={m("homilyDescription")}
          value={church.ratings.homily}
          label={label(church.ratings.homily)}
        />
        <MetricCard
          icon="pulse_alert"
          title={submission("vibrancy")}
          description={m("vibrancyDescription")}
          value={church.ratings.vibrancy}
          label={label(church.ratings.vibrancy)}
        />
      </div>
    </section>
  );
}
