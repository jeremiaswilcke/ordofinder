import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRatingLabel(value: number) {
  if (value >= 9.5) return "Exceptional";
  if (value >= 8.5) return "Excellent";
  if (value >= 7.5) return "Strong";
  if (value >= 6.5) return "Good";
  if (value >= 5.5) return "Fair";
  return "Needs Support";
}

export function formatVibrancyLabel(value: number) {
  if (value >= 9) return "Vibrant";
  if (value >= 7.5) return "Active";
  if (value >= 6) return "High";
  return "Quiet";
}

export function computeNextCelebration(startTime: string) {
  const now = new Date();
  const [hours, minutes] = startTime.split(":").map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  if (next.getTime() < now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  const diff = Math.round((next.getTime() - now.getTime()) / 60000);
  if (diff <= 90) {
    return `Starts in ${diff}m`;
  }

  return startTime;
}
