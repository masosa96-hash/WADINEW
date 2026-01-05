import { z } from "zod";
import { brainSchema } from "./schemas";
import { callLLM } from "./llm";

const MAX_RETRIES = 2;

export type BrainResult = z.infer<typeof brainSchema> & {
  meta?: {
    retries: number;
    degraded?: boolean;
  };
};

export async function runBrain(input: unknown): Promise<BrainResult> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await callLLM(input);
      const parsed = brainSchema.safeParse(raw);

      if (parsed.success) {
        return {
          ...parsed.data,
          meta: { retries: attempt },
        };
      }

      lastError = parsed.error;
      // Optional: log warning here
    } catch (e) {
      lastError = e;
    }
  }

  // Fallback seguro (NO 500)
  return {
    response: "Tuve un problema al procesar la respuesta interna. ¿Podrías reformular?",
    tone: "neutral",
    risks: [],
    smokeIndex: 0,
    meta: {
      retries: MAX_RETRIES,
      degraded: true,
    },
  };
}
