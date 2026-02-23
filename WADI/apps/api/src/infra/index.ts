/**
 * Infra Layer — External provider entry point
 *
 * Responsibilities:
 *   - Cloud deployment (Render, Vercel)
 *   - Metrics collection
 *   - External API adapters
 *
 * Does NOT know about: domain logic, LLM prompts, user sessions.
 * Listens to the Event Bus to trigger side effects.
 */

export { deployService } from "../services/deploy/deploy-service";
