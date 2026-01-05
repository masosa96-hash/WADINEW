import { z } from "zod";

export const riskSchema = z.object({
  code: z.string().optional(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().optional(),
});

export const brainSchema = z.object({
  response: z.string(),
  tone: z.enum(["hostile", "neutral", "surgical"]).default("neutral"),
  risks: z.array(riskSchema).default([]),
  smokeIndex: z.number().default(0),
});

export type BrainSchema = z.infer<typeof brainSchema>;
