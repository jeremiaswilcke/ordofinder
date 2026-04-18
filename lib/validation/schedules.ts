import { z } from "zod";

const TIME_RX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const TIME_ERROR = "Zeit im Format HH:MM";

export const massTimeSchema = z.object({
  churchId: z.string().uuid(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(TIME_RX, TIME_ERROR),
  languageCode: z
    .string()
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
  notes: z.string().trim().max(200).optional().nullable(),
});

export type MassTimeInput = z.infer<typeof massTimeSchema>;

export const confessionTimeSchema = z
  .object({
    churchId: z.string().uuid(),
    weekday: z.number().int().min(0).max(6),
    startTime: z.string().regex(TIME_RX, TIME_ERROR),
    endTime: z.string().regex(TIME_RX, TIME_ERROR).optional().nullable(),
    languageCode: z
      .string()
      .min(2)
      .max(8)
      .optional()
      .nullable()
      .transform((v) => (v ? v.toLowerCase() : null)),
    notes: z.string().trim().max(200).optional().nullable(),
  })
  .refine(
    (v) => !v.endTime || v.endTime > v.startTime,
    "Ende muss nach Start liegen"
  );

export type ConfessionTimeInput = z.infer<typeof confessionTimeSchema>;
