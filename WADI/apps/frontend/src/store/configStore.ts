import { create } from "zustand";
import { supabase } from "../config/supabase";

interface ConfigState {
  language: string;
  theme: string;
  systemPrompt: string;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  wipeAllData: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  language: localStorage.getItem("wadi-lang") || "es",
  theme: localStorage.getItem("wadi-theme") || "system",
  systemPrompt: "",

  // --- GENERAL ---
  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem("wadi-lang", lang);
    // Aquí podrías disparar i18next.changeLanguage(lang)
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("wadi-theme", theme);
    const root = window.document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  },

  // --- DATA (Borrar lo que está dando vueltas) ---
  wipeAllData: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Borra conversaciones (el ON DELETE CASCADE borrará los mensajes)
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      window.location.reload(); // Reinicio total para limpiar la UI
    } else {
      console.error("Error wiping data:", error);
    }
  },
}));
