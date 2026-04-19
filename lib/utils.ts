import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Liefert einen i18n-Key-Token (keinen finalen String!) fuer die Rating-Stufe.
 * Der Caller uebersetzt mit t(`ratings.${ratingLabelKey(value)}`).
 */
export function ratingLabelKey(value: number): string {
  if (value >= 9.5) return "exceptional";
  if (value >= 8.5) return "excellent";
  if (value >= 7.5) return "strong";
  if (value >= 6.5) return "good";
  if (value >= 5.5) return "fair";
  return "needsSupport";
}

/**
 * Liefert einen i18n-Key-Token fuer die Vibrancy-Stufe. Siehe ratingLabelKey.
 */
export function vibrancyLabelKey(value: number): string {
  if (value >= 9) return "vibrant";
  if (value >= 7.5) return "active";
  if (value >= 6) return "high";
  return "quiet";
}

/**
 * Berechnet Minuten bis zur naechsten Messe auf Basis der Uhrzeit
 * (weekday-unabhaengig, gedacht fuer "Beginnt in X Min."-Labels).
 * Liefert entweder { minutes } oder { time }.
 */
export function computeNextCelebration(
  startTime: string
): { minutes: number } | { time: string } {
  const now = new Date();
  const [hours, minutes] = startTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() < now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  const diff = Math.round((next.getTime() - now.getTime()) / 60000);
  if (diff <= 90) {
    return { minutes: diff };
  }
  return { time: startTime };
}
