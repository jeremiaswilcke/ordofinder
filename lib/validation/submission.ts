import { z } from "zod";

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
});

export type ChurchSubmissionInput = z.infer<typeof churchSubmissionSchema>;
