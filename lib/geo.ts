const EARTH_RADIUS_KM = 6371;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistanceKm(km: number, locale: string): string {
  if (!Number.isFinite(km)) return "—";
  if (km < 1) {
    const meters = Math.round(km * 1000 / 10) * 10;
    const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    return `${fmt.format(meters)} m`;
  }
  const fmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: km < 10 ? 1 : 0,
    maximumFractionDigits: km < 10 ? 1 : 0,
  });
  return `${fmt.format(km)} km`;
}
