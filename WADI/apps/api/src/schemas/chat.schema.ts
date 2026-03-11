import { z } from "zod";

export const chatRunSchema = z.object({
  body: z.object({
    input: z.string().min(1, "El mensaje no puede estar vacío"),
  }),
  params: z.object({
    id: z.string().uuid("ID de proyecto inválido (UUID esperado)").or(z.literal("guest")),
  })
});

// Esquema para validar la respuesta que viene del motor de IA
const GenomeInsightSchema = z.object({
  id: z.string(),
  label: z.string(),
  confidence: z.number(),
  tags: z.array(z.string())
});

export const AIResponseSchema = z.object({
  content: z.string(),
  insights: z.array(GenomeInsightSchema).optional()
});
