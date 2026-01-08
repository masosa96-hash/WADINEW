import { PostgrestError } from "@supabase/supabase-js";
import { useLogStore } from "../store/logStore";

/**
 * Detects and handles Supabase/PostgreSQL errors, specifically RLS blocks (42501).
 */
export const handleSupabaseError = (error: PostgrestError | Error | { message: string, code?: string } | null | unknown, context: string) => {
  const err = error as any;
  if (!error) return;

  const errorCode = (error as PostgrestError).code || "";
  const errorMessage = error.message || "Error desconocido";

  console.error(`[WADI_ERROR][${context}]:`, error);

  if (errorCode === "42501") {
    const rlsMsg = "Acceso denegado por seguridad (RLS). No tienes permisos para esta acción o ver estos datos.";
    useLogStore.getState().addLog(rlsMsg, "error");
    return rlsMsg;
  }

  // Handle common Auth/Network errors
  if (errorMessage.includes("FetchError") || errorMessage.includes("network")) {
    const netMsg = "Error de red. El búnker no responde.";
    useLogStore.getState().addLog(netMsg, "error");
    return netMsg;
  }

  // Fallback
  useLogStore.getState().addLog(`Error en ${context}: ${errorMessage}`, "error");
  return errorMessage;
};
