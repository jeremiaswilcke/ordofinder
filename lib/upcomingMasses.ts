import type { Church, MassTime } from "@/lib/types";

export type UpcomingMass = {
  church: Church;
  massTime: MassTime;
  when: Date;
};

const WEEKDAY_INDICES: Record<string, number[]> = {
  Sunday: [0],
  Monday: [1],
  Tuesday: [2],
  Wednesday: [3],
  Thursday: [4],
  Friday: [5],
  Saturday: [6],
  // Convention in our data model: "Weekday" means Mon–Fri.
  Weekday: [1, 2, 3, 4, 5],
};

function parseTime(startTime: string): [number, number] {
  const [h, m] = startTime.split(":").map(Number);
  return [Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0];
}

function nextOccurrence(
  from: Date,
  weekdayIndex: number,
  hours: number,
  minutes: number
): Date {
  const candidate = new Date(from);
  const currentDay = candidate.getDay();
  let dayOffset = (weekdayIndex - currentDay + 7) % 7;
  candidate.setDate(candidate.getDate() + dayOffset);
  candidate.setHours(hours, minutes, 0, 0);
  if (candidate.getTime() <= from.getTime()) {
    // Already passed today → jump one week
    candidate.setDate(candidate.getDate() + 7);
  }
  return candidate;
}

export function computeUpcomingMasses(
  churches: Church[],
  options: { from?: Date; horizonDays?: number; limit?: number } = {}
): UpcomingMass[] {
  const from = options.from ?? new Date();
  const horizonMs =
    (options.horizonDays ?? 14) * 24 * 60 * 60 * 1000;
  const limit = options.limit ?? 30;

  const entries: UpcomingMass[] = [];

  for (const church of churches) {
    for (const mass of church.masses) {
      const indices = WEEKDAY_INDICES[mass.weekday] ?? [];
      if (indices.length === 0) continue;
      const [h, m] = parseTime(mass.startTime);
      let soonest: Date | null = null;
      for (const idx of indices) {
        const when = nextOccurrence(from, idx, h, m);
        if (!soonest || when.getTime() < soonest.getTime()) {
          soonest = when;
        }
      }
      if (!soonest) continue;
      if (soonest.getTime() - from.getTime() > horizonMs) continue;
      entries.push({ church, massTime: mass, when: soonest });
    }
  }

  entries.sort((a, b) => a.when.getTime() - b.when.getTime());
  return entries.slice(0, limit);
}

export function formatRelativeTime(
  when: Date,
  from: Date,
  locale: string
): string {
  const diffMinutes = Math.round((when.getTime() - from.getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diffMinutes < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function formatDateTime(when: Date, locale: string): string {
  const sameDay = isSameLocalDate(when, new Date());
  if (sameDay) {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(when);
  }
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(when);
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
