/**
 * shared/models.ts
 *
 * Common domain models for WADI.
 */

export type WadiStage = "exploration" | "clarification" | "confirmation" | "project_creation";

export interface WadiState {
  stage: WadiStage;
  questions_asked: number;
  intent_confidence: number;
  idea_vector: Record<string, unknown>;
  missing_dims: string[];
}

export interface WadiInterpretResult {
  stage: WadiStage;
  ui_hint?: string;
  questions?: string[];
  message?: string;
  intent?: Record<string, unknown>;
  project?: Record<string, unknown>;
  first_step?: string;
  state: WadiState;
  content?: string; // SSE support
}
