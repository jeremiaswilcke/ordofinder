import type { Church } from "@/lib/types";
import { MassTimeCard } from "../ui/MassTimeCard";

export function SchedulePanel({ church }: { church: Church }) {
  return (
    <section className="rounded-lg bg-primary p-8 text-on-primary">
      <p className="text-[10px] uppercase tracking-[0.2em] text-on-primary/70">Next Celebrations</p>
      <h2 className="mt-3 font-headline text-4xl">Schedule Block</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {church.masses.map((mass) => (
          <MassTimeCard
            key={`${mass.weekday}-${mass.startTime}-${mass.language}`}
            weekday={mass.weekday}
            time={mass.startTime}
            label={`${mass.language.toUpperCase()} · ${mass.rite.replaceAll("_", " ")}`}
          />
        ))}
      </div>
    </section>
  );
}
