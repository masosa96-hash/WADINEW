import { z } from "zod";

export const chatRunSchema = z.object({
  body: z.object({
    input: z.string().min(1, "El mensaje no puede estar vacío"),
  }),
  params: z.object({
    id: z.string().uuid("ID de proyecto inválido (UUID esperado)").or(z.literal("guest")),
  })
});
