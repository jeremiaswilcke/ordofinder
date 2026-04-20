import { z } from "zod";

const TIME_RX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const submissionMassTimeSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(TIME_RX, "HH:MM"),
  languageCode: z
    .string()
    .trim()
    .min(2)
    .max(8)
    .transform((v) => v.toLowerCase()),
  rite: z.enum([
    "roman",
    "byzantine",
    "maronite",
    "chaldean",
    "syro_malabar",
    "syro_malankara",
    "coptic_catholic",
    "ethiopian_catholic",
    "armenian_catholic",
    "ambrosian",
    "mozarabic",
    "other",
  ]),
  form: z.enum(["novus_ordo", "tridentine", "not_applicable"]),
  notes: z.string().trim().max(200).optional().or(z.literal("")),
});

export type SubmissionMassTime = z.infer<typeof submissionMassTimeSchema>;

export const churchSubmissionSchema = z.object({
  churchName: z.string().trim().min(3).max(160),
  city: z.string().trim().min(2).max(120),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  timezone: z.string().trim().min(3).max(64),
  diocese: z.string().trim().max(160).optional().or(z.literal("")),
  consecrationYear: z.coerce.number().int().min(100).max(new Date().getFullYear()).optional(),
  architecturalStyle: z.string().trim().max(40).optional().or(z.literal("")),
  capacity: z.coerce.number().int().min(10).max(50000).optional(),
  liturgyQuality: z.coerce.number().int().min(1).max(10),
  music: z.coerce.number().int().min(1).max(10),
  homilyClarity: z.coerce.number().int().min(1).max(10),
  vibrancy: z.coerce.number().int().min(1).max(10),
  shortNote: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  massTimes: z.array(submissionMassTimeSchema).max(30).optional(),
});

export type ChurchSubmissionInput = z.infer<typeof churchSubmissionSchema>;
