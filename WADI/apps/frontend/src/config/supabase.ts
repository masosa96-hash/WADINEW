import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[WADI_CONFIG_ERROR]: VITE_SUPABASE_URL o VITE_SUPABASE_KEY no están definidas.");
  // Lanzamos error para que el ErrorBoundary lo capture en lugar de pantalla negra
  throw new Error("CONFIG_ERROR: Faltan variables de entorno de Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
