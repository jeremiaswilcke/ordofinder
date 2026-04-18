import { haversineDistanceKm } from "@/lib/geo";
import type { Church } from "@/lib/types";

export function sortChurchesByDistance(
  churches: Church[],
  from: { latitude: number; longitude: number },
  options: { limit?: number; maxKm?: number } = {}
): Array<Church & { distanceKm: number }> {
  const limit = options.limit ?? 20;
  const maxKm = options.maxKm ?? Infinity;
  return churches
    .filter(
      (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
    )
    .map((c) => ({
      ...c,
      distanceKm: haversineDistanceKm(from, {
        latitude: c.latitude,
        longitude: c.longitude,
      }),
    }))
    .filter((c) => c.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
