import type { Church } from "@/lib/types";

export function SchedulePanel({ church }: { church: Church }) {
  return (
    <section className="grid gap-10 lg:grid-cols-12">
      <div className="rounded-lg bg-surface-container p-12 text-primary lg:col-span-4">
        <h2 className="font-headline text-2xl font-bold italic">Current Schedule</h2>
        <ul className="mt-8 space-y-6">
          {church.masses.slice(0, 4).map((mass) => (
            <li key={`${mass.weekday}-${mass.startTime}-${mass.language}`} className="flex justify-between border-b border-primary/10 pb-4">
              <span className="text-[10px] uppercase tracking-widest">{mass.weekday}</span>
              <span className="font-semibold">{mass.startTime}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-8 lg:col-span-8 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h4 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-outline">Community Hub</h4>
            <h3 className="font-headline text-2xl font-bold text-on-surface">Youth & Engagement</h3>
            <p className="mt-4 font-light leading-relaxed text-on-surface-variant">
              The living pulse of the parish appears in confession, adoration, music, catechesis and the steady companionship of the faithful.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl shadow-archival">
            <img
              alt="Community gathering"
              className="aspect-video h-full w-full object-cover"
              src={church.heroImageUrl}
            />
          </div>
        </div>
        <div className="space-y-8 pt-12">
          <div className="overflow-hidden rounded-xl shadow-archival">
            <img
              alt="Sacred architectural detail"
              className="aspect-video h-full w-full object-cover"
              src={church.heroImageUrl}
            />
          </div>
          <div>
            <h4 className="mb-3 text-[10px] uppercase tracking-[0.2em] text-outline">Silent Adoration</h4>
            <h3 className="font-headline text-2xl font-bold text-on-surface">Eucharistic Chapel</h3>
            <p className="mt-4 font-light leading-relaxed text-on-surface-variant">
              A quieter counterweight to the public church: a place for prayer, recollection and the faithful continuity of devotion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
