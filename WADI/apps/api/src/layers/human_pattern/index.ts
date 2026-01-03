import { detectHumanPattern } from "./detectPattern";
import { composeResponse } from "./composeResponse";

// WADI no simula inteligencia.
// Aplica memoria social.
// Si puede reconocer el patrón humano,
// no llama al modelo.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function wadiPreFlight(userInput: string, context: any = {}) {
  const pattern = detectHumanPattern(userInput, context);

  // patrones que NO merecen gastar tokens (Early Exit)
  if (
    pattern === "VAGUE_AMBITION" ||
    pattern === "FAKE_DEPTH" ||
    pattern === "RESCUE_REQUEST" ||
    pattern === "PROCRASTINATION_LOOP" ||
    pattern === "BLOCKED_BUT_REAL"
  ) {
    console.log(`[WADI HUMAN LAYER] Pre-empted Pattern: ${pattern}`);
    return {
      reply: composeResponse(pattern),
      pattern: pattern,
    };
  }

  return null; // seguir al LLM
}
