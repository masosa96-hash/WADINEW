/**
 * wadi-interpret.service.ts
 *
 * Orquestador central del pipeline de Wadi en Node.
 * Flujo completo:
 *   1. Cargar estado conversacional desde Supabase
 *   2. Llamar al AI Engine (FastAPI) con el mensaje + estado
 *   3. Guardar el nuevo estado en Supabase
 *   4. Devolver la respuesta al cliente
 *
 * El AI Engine NO persiste estado. Node es el responsable de la memoria.
 */

import { supabase } from "../supabase";
import { logger } from "../core/logger";

const AI_ENGINE_URL = process.env.WADI_AI_ENGINE_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface WadiState {
  stage: "exploration" | "clarification" | "confirmation" | "project_creation";
  questions_asked: number;
  intent_confidence: number;
  idea_vector: Record<string, unknown>;
  missing_dims: string[];
}

export interface WadiInterpretResult {
  stage: string;
  questions?: string[];
  message?: string;
  intent?: Record<string, unknown>;
  project?: Record<string, unknown>;
  first_step?: string;
  state: WadiState;
}

// ---------------------------------------------------------------------------
// Cargar estado desde Supabase
// ---------------------------------------------------------------------------

async function loadConversationState(userId: string): Promise<WadiState | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("wadi_conversation_states")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.warn({ msg: "wadi_state_load_error", userId, error: error.message });
    return null;
  }

  return (data?.state as WadiState) ?? null;
}

// ---------------------------------------------------------------------------
// Guardar estado en Supabase (upsert — una fila por usuario)
// ---------------------------------------------------------------------------

async function saveConversationState(userId: string, state: WadiState): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("wadi_conversation_states")
    .upsert(
      {
        user_id: userId,
        stage: state.stage,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    logger.warn({ msg: "wadi_state_save_error", userId, error: error.message });
  }
}

// ---------------------------------------------------------------------------
// Llamada al AI Engine (FastAPI)
// ---------------------------------------------------------------------------

async function callAiEngine(
  message: string,
  userId: string,
  state: WadiState | null
): Promise<WadiInterpretResult> {
  const response = await fetch(`${AI_ENGINE_URL}/wadi/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, user_id: userId, state }),
    signal: AbortSignal.timeout(15_000), // 15s máximo
  });

  if (!response.ok) {
    throw new Error(`AI Engine error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<WadiInterpretResult>;
}

// ---------------------------------------------------------------------------
// Función principal — usada por el controller
// ---------------------------------------------------------------------------

export async function interpretMessage(
  message: string,
  userId: string
): Promise<WadiInterpretResult> {
  // 1. Cargar estado previo del usuario
  const currentState = await loadConversationState(userId);

  logger.info({
    msg: "wadi_interpret_start",
    userId,
    stage: currentState?.stage ?? "new",
    confidence: currentState?.intent_confidence ?? 0,
  });

  // 2. Llamar al AI Engine con el estado completo
  const result = await callAiEngine(message, userId, currentState);

  // 3. Persistir el nuevo estado (siempre que el engine devuelva state)
  if (result.state) {
    await saveConversationState(userId, result.state);
  }

  logger.info({
    msg: "wadi_interpret_done",
    userId,
    newStage: result.stage,
    confidence: result.state?.intent_confidence ?? 0,
  });

  return result;
}

// ---------------------------------------------------------------------------
// Reset del estado conversacional (para cuando el usuario quiere empezar de cero)
// ---------------------------------------------------------------------------

export async function resetConversationState(userId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("wadi_conversation_states")
    .delete()
    .eq("user_id", userId);

  logger.info({ msg: "wadi_state_reset", userId });
}
