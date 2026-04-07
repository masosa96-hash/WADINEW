/**
 * shared/models.ts
 *
 * Common domain models for WADI.
 */

export type WadiStage = "exploration" | "clarification" | "confirmation" | "project_creation" | "project_saved";

export interface WadiState {
  stage: WadiStage;
  questions_asked: number;
  intent_confidence: number;
  idea_vector: Record<string, unknown>;
  missing_dims: string[];
}

export interface ProjectMilestone {
  title: string;
  description: string;
}

export interface WadiProjectContext {
  project_name: string;
  summary: string;
  tech_stack: string[];
  milestones: ProjectMilestone[];
  priority: "High" | "Medium" | "Low";
  missing_dims: string[];
  questions: string[];
}

export interface WadiInterpretResult {
  stage: WadiStage;
  ui_hint?: string;
  questions?: string[];
  message?: string;
  intent?: Record<string, unknown>;
  project?: Record<string, unknown>;
  project_context?: WadiProjectContext;
  first_step?: string;
  state: WadiState;
  content?: string; // SSE support
}
