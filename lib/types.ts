export type ArchitecturalStyle =
  | "romanesque"
  | "romanesque_revival"
  | "gothic"
  | "gothic_revival"
  | "renaissance"
  | "baroque"
  | "rococo"
  | "neoclassical"
  | "neo_byzantine"
  | "modernist_sacred"
  | "contemporary"
  | "vernacular"
  | "other";

export type Rite =
  | "roman"
  | "byzantine"
  | "maronite"
  | "chaldean"
  | "syro_malabar"
  | "syro_malankara"
  | "coptic_catholic"
  | "ethiopian_catholic"
  | "armenian_catholic"
  | "ambrosian"
  | "mozarabic"
  | "other";

export type Form = "novus_ordo" | "tridentine" | "not_applicable";

export type RatingScores = {
  liturgy: number;
  music: number;
  homily: number;
  vibrancy: number;
  overall: number;
};

export type MassTime = {
  weekday: string;
  startTime: string;
  language: string;
  rite: Rite;
  form: Form;
  notes?: string;
  musicStyles: string[];
};

export type Church = {
  slug: string;
  name: string;
  city: string;
  countryCode: string;
  subdivisionCode?: string;
  address: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  diocese?: string;
  consecrationYear?: number;
  architecturalStyle?: ArchitecturalStyle;
  capacity?: number;
  shortNote?: string;
  description: string;
  heroImageUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  tags: string[];
  ratings: RatingScores;
  masses: MassTime[];
};

export type CityArchive = {
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  churchCount: number;
  subtitle: string;
  featuredChurchSlug: string;
};
