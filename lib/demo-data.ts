import type { Church, CityArchive } from "./types";

export const churches: Church[] = [
  {
    slug: "stephansdom",
    name: "Stephansdom",
    city: "Vienna",
    countryCode: "AT",
    subdivisionCode: "AT-9",
    address: "Stephansplatz 3, 1010 Vienna",
    postalCode: "1010",
    latitude: 48.2085,
    longitude: 16.3731,
    timezone: "Europe/Vienna",
    diocese: "Erzdioezese Wien",
    consecrationYear: 1147,
    architecturalStyle: "gothic",
    capacity: 20000,
    shortNote: "Cathedral archive with Latin and German celebrations.",
    description:
      "The cathedral anchor of Vienna's Catholic life, with a broad liturgical rhythm, strong musical culture and a public-facing archival presence.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80",
    tags: ["reverent_liturgy", "good_music", "confession_available"],
    ratings: { liturgy: 9.4, music: 9.7, homily: 8.9, vibrancy: 8.8, overall: 9.2 },
    masses: [
      { weekday: "Sunday", startTime: "09:45", language: "la", rite: "roman", form: "tridentine", musicStyles: ["Gregorian", "Polyphony"] },
      { weekday: "Sunday", startTime: "11:00", language: "de", rite: "roman", form: "novus_ordo", musicStyles: ["Organ", "Traditional Hymns"] },
      { weekday: "Weekday", startTime: "18:00", language: "de", rite: "roman", form: "novus_ordo", musicStyles: ["Organ"] }
    ]
  },
  {
    slug: "peterskirche-vienna",
    name: "Peterskirche",
    city: "Vienna",
    countryCode: "AT",
    subdivisionCode: "AT-9",
    address: "Petersplatz 1, 1010 Vienna",
    postalCode: "1010",
    latitude: 48.2104,
    longitude: 16.3695,
    timezone: "Europe/Vienna",
    diocese: "Erzdioezese Wien",
    consecrationYear: 1733,
    architecturalStyle: "baroque",
    capacity: 500,
    shortNote: "Italian community and strong adoration rhythm.",
    description:
      "A baroque interior with a steady devotional life, daily adoration and a cultivated music program that makes it ideal for the archive's editorial voice.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
    tags: ["good_music", "daily_adoration", "confession_available"],
    ratings: { liturgy: 9.0, music: 9.3, homily: 8.1, vibrancy: 8.6, overall: 8.8 },
    masses: [
      { weekday: "Sunday", startTime: "08:00", language: "de", rite: "roman", form: "novus_ordo", musicStyles: ["Traditional Hymns"] },
      { weekday: "Sunday", startTime: "10:00", language: "de", rite: "roman", form: "novus_ordo", musicStyles: ["Organ"] },
      { weekday: "Sunday", startTime: "17:30", language: "la", rite: "roman", form: "novus_ordo", notes: "Vespers", musicStyles: ["Gregorian"] }
    ]
  },
  {
    slug: "karlskirche",
    name: "Karlskirche",
    city: "Vienna",
    countryCode: "AT",
    subdivisionCode: "AT-9",
    address: "Karlsplatz 10, 1040 Vienna",
    postalCode: "1040",
    latitude: 48.1982,
    longitude: 16.3717,
    timezone: "Europe/Vienna",
    consecrationYear: 1737,
    architecturalStyle: "baroque",
    capacity: 800,
    shortNote: "Polyphony-rich celebration in a monumental setting.",
    description:
      "An archival favorite for polyphonic liturgy, generous acoustics and a composed, urbane prayer atmosphere.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1529429617124-aee711a5ac1c?auto=format&fit=crop&w=1200&q=80",
    tags: ["good_music", "reverent_liturgy"],
    ratings: { liturgy: 8.8, music: 9.5, homily: 7.8, vibrancy: 7.3, overall: 8.4 },
    masses: [
      { weekday: "Sunday", startTime: "11:00", language: "de", rite: "roman", form: "novus_ordo", musicStyles: ["Polyphony", "Organ"] }
    ]
  },
  {
    slug: "st-patricks-cathedral",
    name: "St. Patrick's Cathedral",
    city: "New York",
    countryCode: "US",
    subdivisionCode: "US-NY",
    address: "5th Avenue, New York, NY 10022",
    postalCode: "10022",
    latitude: 40.7585,
    longitude: -73.975,
    timezone: "America/New_York",
    diocese: "Archdiocese of New York",
    consecrationYear: 1879,
    architecturalStyle: "gothic_revival",
    capacity: 3000,
    shortNote: "Urban cathedral archive with broad English schedule.",
    description:
      "A highly visible urban cathedral balancing visitor traffic with a recognizable sacramental rhythm and strong choir traditions.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=1200&q=80",
    tags: ["good_music", "confession_available", "english_available"],
    ratings: { liturgy: 8.7, music: 9.2, homily: 8.4, vibrancy: 9.0, overall: 8.8 },
    masses: [
      { weekday: "Sunday", startTime: "10:15", language: "en", rite: "roman", form: "novus_ordo", musicStyles: ["Organ", "Traditional Hymns"] },
      { weekday: "Sunday", startTime: "12:00", language: "en", rite: "roman", form: "novus_ordo", musicStyles: ["Polyphony"] }
    ]
  },
  {
    slug: "st-georges-syro-malabar-cathedral",
    name: "St. George's Syro-Malabar Cathedral",
    city: "Thrissur",
    countryCode: "IN",
    subdivisionCode: "IN-KL",
    address: "Palace Road, Thrissur",
    latitude: 10.5276,
    longitude: 76.2144,
    timezone: "Asia/Kolkata",
    diocese: "Archdiocese of Thrissur",
    consecrationYear: 1814,
    architecturalStyle: "other",
    capacity: 2500,
    shortNote: "Eastern Catholic archive with deeply rooted communal participation.",
    description:
      "A Syro-Malabar cathedral with a strong daily rhythm, visibly communal prayer and a local liturgical identity that broadens the archive's global frame.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    tags: ["traditional_style"],
    ratings: { liturgy: 9.1, music: 8.2, homily: 8.6, vibrancy: 9.4, overall: 8.8 },
    masses: [
      { weekday: "Daily", startTime: "06:30", language: "ml", rite: "syro_malabar", form: "not_applicable", musicStyles: ["Other"] }
    ]
  },
  {
    slug: "santa-maria-maggiore",
    name: "Santa Maria Maggiore",
    city: "Rome",
    countryCode: "IT",
    subdivisionCode: "IT-RM",
    address: "Piazza di Santa Maria Maggiore, Rome",
    latitude: 41.8978,
    longitude: 12.4989,
    timezone: "Europe/Rome",
    diocese: "Diocese of Rome",
    consecrationYear: 432,
    architecturalStyle: "romanesque",
    capacity: 5000,
    shortNote: "Ancient Marian basilica with layered liturgical memory.",
    description:
      "One of Rome's foundational basilicas, holding together pilgrimage, solemnity and a stable pattern of reverent celebration.",
    heroImageUrl:
      "https://images.unsplash.com/photo-1524492449090-ed3f1474f965?auto=format&fit=crop&w=1200&q=80",
    tags: ["reverent_liturgy", "good_music", "adoration"],
    ratings: { liturgy: 9.3, music: 9.0, homily: 8.3, vibrancy: 8.7, overall: 8.8 },
    masses: [
      { weekday: "Sunday", startTime: "10:00", language: "it", rite: "roman", form: "novus_ordo", musicStyles: ["Organ", "Polyphony"] },
      { weekday: "Sunday", startTime: "12:00", language: "la", rite: "roman", form: "novus_ordo", musicStyles: ["Gregorian"] }
    ]
  }
];

export const cities: CityArchive[] = [
  {
    slug: "vienna",
    city: "Vienna",
    country: "Austria",
    countryCode: "AT",
    churchCount: 124,
    subtitle: "Imperial archive with cathedral gravity and baroque devotional density.",
    featuredChurchSlug: "stephansdom"
  },
  {
    slug: "new-york",
    city: "New York",
    country: "United States",
    countryCode: "US",
    churchCount: 87,
    subtitle: "Dense urban archive with cathedral, parish and missionary patterns.",
    featuredChurchSlug: "st-patricks-cathedral"
  },
  {
    slug: "rome",
    city: "Rome",
    country: "Italy",
    countryCode: "IT",
    churchCount: 203,
    subtitle: "Deep continuity, layered basilicas and a living memory of rite.",
    featuredChurchSlug: "santa-maria-maggiore"
  },
  {
    slug: "thrissur",
    city: "Thrissur",
    country: "India",
    countryCode: "IN",
    churchCount: 31,
    subtitle: "Eastern Catholic strength with daily rhythm and communal devotion.",
    featuredChurchSlug: "st-georges-syro-malabar-cathedral"
  }
];

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
