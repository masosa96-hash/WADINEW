import { z } from "zod";

export const userPreferencesSchema = z.object({
  body: z.object({
    naturalness_level: z.number().min(1).max(10).optional(),
    active_persona: z.string().min(1).max(50).optional(),
  })
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>["body"];
