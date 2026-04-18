import { cities as demoCities, churches as demoChurches, getChurchBySlug, getChurchesByCity, getCityBySlug } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Church, CityArchive, MassTime, RatingScores } from "@/lib/types";

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function mapRatings(summary?: {
  avg_liturgy: number | null;
  avg_music: number | null;
  avg_homily: number | null;
  avg_vibrancy: number | null;
  avg_overall: number | null;
}): RatingScores {
  return {
    liturgy: summary?.avg_liturgy ?? 0,
    music: summary?.avg_music ?? 0,
    homily: summary?.avg_homily ?? 0,
    vibrancy: summary?.avg_vibrancy ?? 0,
    overall: summary?.avg_overall ?? 0,
  };
}

function mapMassTime(row: {
  weekday: number;
  start_time: string;
  language_code: string;
  rite: string;
  form: string;
  notes: string | null;
}): MassTime {
  return {
    weekday: WEEKDAY_LABELS[row.weekday] ?? "Sunday",
    startTime: row.start_time.slice(0, 5),
    language: row.language_code,
    rite: row.rite as MassTime["rite"],
    form: row.form as MassTime["form"],
    notes: row.notes ?? undefined,
    musicStyles: [],
  };
}

async function getSupabaseChurches(): Promise<Church[]> {
  const supabase = await createServerSupabaseClient();
  const { data: churches, error } = await supabase
    .from("churches")
    .select("id,slug,name,address,city,country_code,subdivision_code,postal_code,latitude,longitude,timezone,diocese,consecration_year,architectural_style,capacity,short_note,description,hero_image_url,website,phone,email")
    .eq("status", "approved")
    .order("city");

  if (error || !churches) {
    return demoChurches;
  }

  const churchIds = churches.map((church) => church.id);
  const [tagsResult, massTimesResult, ratingsResult] = await Promise.all([
    supabase.from("church_tags").select("church_id,tags:tag_id(slug)").in("church_id", churchIds),
    supabase
      .from("mass_times")
      .select("church_id,weekday,start_time,language_code,rite,form,notes")
      .in("church_id", churchIds)
      .order("weekday")
      .order("start_time"),
    supabase
      .from("church_ratings_summary")
      .select("church_id,avg_liturgy,avg_music,avg_homily,avg_vibrancy,avg_overall")
      .in("church_id", churchIds),
  ]);

  const tagMap = new Map<string, string[]>();
  for (const row of tagsResult.data ?? []) {
    const existing = tagMap.get(row.church_id) ?? [];
    const slug = Array.isArray(row.tags) ? undefined : (row.tags as { slug?: string } | null)?.slug;
    if (slug) existing.push(slug);
    tagMap.set(row.church_id, existing);
  }

  const massMap = new Map<string, MassTime[]>();
  for (const row of massTimesResult.data ?? []) {
    const existing = massMap.get(row.church_id) ?? [];
    existing.push(mapMassTime(row));
    massMap.set(row.church_id, existing);
  }

  const ratingsMap = new Map<string, RatingScores>();
  for (const row of ratingsResult.data ?? []) {
    ratingsMap.set(row.church_id, mapRatings(row));
  }

  return churches.map((church) => ({
    slug: church.slug,
    name: church.name,
    city: church.city,
    countryCode: church.country_code,
    subdivisionCode: church.subdivision_code ?? undefined,
    address: church.address,
    postalCode: church.postal_code ?? undefined,
    latitude: Number(church.latitude),
    longitude: Number(church.longitude),
    timezone: church.timezone,
    diocese: church.diocese ?? undefined,
    consecrationYear: church.consecration_year ?? undefined,
    architecturalStyle: (church.architectural_style as Church["architecturalStyle"]) ?? undefined,
    capacity: church.capacity ?? undefined,
    shortNote: church.short_note ?? undefined,
    description: church.description,
    heroImageUrl: church.hero_image_url ?? undefined,
    website: church.website ?? undefined,
    phone: church.phone ?? undefined,
    email: church.email ?? undefined,
    tags: tagMap.get(church.id) ?? [],
    ratings: ratingsMap.get(church.id) ?? { liturgy: 0, music: 0, homily: 0, vibrancy: 0, overall: 0 },
    masses: massMap.get(church.id) ?? [],
  }));
}

export async function listChurches() {
  if (!hasSupabaseEnv()) return demoChurches;
  return getSupabaseChurches();
}

export async function listCities(): Promise<CityArchive[]> {
  const churches = await listChurches();

  if (!hasSupabaseEnv()) return demoCities;

  const groups = new Map<string, CityArchive>();
  for (const church of churches) {
    const slug = church.city.toLowerCase().replaceAll(/\s+/g, "-");
    const existing = groups.get(slug);
    if (existing) {
      existing.churchCount += 1;
      continue;
    }

    groups.set(slug, {
      slug,
      city: church.city,
      country: church.countryCode,
      countryCode: church.countryCode,
      churchCount: 1,
      subtitle: church.shortNote ?? "Curated city archive for worthy Catholic celebrations.",
      featuredChurchSlug: church.slug,
    });
  }

  return Array.from(groups.values()).sort((a, b) => b.churchCount - a.churchCount);
}

export async function findChurch(slug: string) {
  if (!hasSupabaseEnv()) return getChurchBySlug(slug);
  const churches = await listChurches();
  return churches.find((church) => church.slug === slug);
}

export async function findCity(slug: string) {
  if (!hasSupabaseEnv()) return getCityBySlug(slug);
  const cities = await listCities();
  return cities.find((city) => city.slug === slug);
}

export async function listChurchesByCity(slug: string) {
  if (!hasSupabaseEnv()) return getChurchesByCity(slug);
  const city = await findCity(slug);
  if (!city) return [];
  const churches = await listChurches();
  return churches.filter((church) => church.city.toLowerCase() === city.city.toLowerCase());
}
