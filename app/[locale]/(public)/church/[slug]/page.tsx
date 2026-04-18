import { notFound } from "next/navigation";
import { ChurchHeroCard } from "@/components/church/ChurchHeroCard";
import { ChurchMetrics } from "@/components/church/ChurchMetrics";
import { SchedulePanel } from "@/components/church/SchedulePanel";
import { findChurch } from "@/lib/archive";

export default async function ChurchDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const church = await findChurch(slug);
  if (!church) notFound();

  return (
    <div className="space-y-8">
      <ChurchHeroCard church={church} />
      <ChurchMetrics church={church} />
      <SchedulePanel church={church} />
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg bg-surface-container-low p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Community Hub</p>
          <h2 className="mt-3 font-headline text-4xl text-primary">Living Memory</h2>
          <p className="mt-4 leading-relaxed text-on-surface-variant">
            Tags, schedules, music practice and parish character are framed as an archive of lived Catholic continuity.
          </p>
        </section>
        <section className="rounded-lg bg-surface-container-lowest p-8 shadow-archival">
          <p className="text-[10px] uppercase tracking-[0.2em] text-outline">Location Card</p>
          <h2 className="mt-3 font-headline text-4xl text-primary">{church.address}</h2>
          <p className="mt-4 leading-relaxed text-on-surface-variant">
            {church.city} · {church.countryCode} · {church.timezone}
          </p>
        </section>
      </div>
    </div>
  );
}
