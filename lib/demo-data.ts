import type { Church, CityArchive } from "./types";

export const churches: Church[] = [];

export const cities: CityArchive[] = [];

export function getChurchBySlug(slug: string) {
  return churches.find((church) => church.slug === slug);
}

export function getCityBySlug(slug: string) {
  return cities.find((city) => city.slug === slug);
}

export function getChurchesByCity(slug: string) {
  const city = getCityBySlug(slug);
  if (!city) return [];
  return churches.filter((church) => church.city.toLowerCase() === city.city.toLowerCase());
}
