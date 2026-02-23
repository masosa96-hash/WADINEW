/**
 * Engine Layer — Execution entry point
 *
 * Responsibilities:
 *   - Project materialization (scaffold + features + files)
 *   - Build verification
 *   - Git isolation
 *
 * Does NOT know about: LLM prompts, user sessions, cloud providers, metrics.
 * Communicates outward exclusively via the Event Bus.
 */

export { materializer, MaterializerService } from "../services/materializer";
export { toolRegistry } from "../services/tool-registry";
