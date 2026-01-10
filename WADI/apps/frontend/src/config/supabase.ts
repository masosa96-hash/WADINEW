import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("[WADI_CONFIG_ERROR]: VITE_SUPABASE_URL o VITE_SUPABASE_KEY no están definidas. Usando modo offline/fallback para evitar crash.");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder_key"
);

// 🔍 Debugging: Solo expone supabase en desarrollo
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as { supabase: unknown }).supabase = supabase;
}
