import { z } from "zod";

export const reviewerApplicationSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(120),
  about: z
    .string()
    .trim()
    .min(10, "Bitte kurz beschreiben, wer du bist (mind. 10 Zeichen)")
    .max(2000),
  motivation: z
    .string()
    .trim()
    .min(10, "Bitte beschreibe deine Motivation (mind. 10 Zeichen)")
    .max(2000),
  preferredCountryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional()
    .nullable(),
  preferredSubdivisionCode: z
    .string()
    .min(2)
    .max(10)
    .optional()
    .nullable(),
});

export type ReviewerApplicationInput = z.infer<typeof reviewerApplicationSchema>;
