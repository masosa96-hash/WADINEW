import { detectHumanPattern } from "./detectPattern.js";
import { composeResponse } from "./composeResponse.js";

// WADI no simula inteligencia.
// Aplica memoria social.
// Si puede reconocer el patrón humano,
// no llama al modelo.

export function wadiPreFlight(userInput, context = {}) {
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
