import { create } from "zustand";
import { supabase } from "../config/supabase";

interface ConfigState {
  language: string;
  theme: string;
  systemPrompt: string;
  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setSystemPrompt: (prompt: string) => void;
  fetchConfig: () => Promise<void>;
  wipeAllData: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  language: localStorage.getItem("wadi-lang") || "es",
  theme: localStorage.getItem("wadi-theme") || "system",
  systemPrompt: localStorage.getItem("wadi-prompt") || "",

  // --- INIT ---
  fetchConfig: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("language, theme, custom_instructions")
      .eq("id", user.id)
      .single();
    if (data) {
      set({
        language: data.language || "es",
        theme: data.theme || "system",
        systemPrompt: data.custom_instructions || "",
      });
      // Update LocalStorage to keep sync
      if (data.language) localStorage.setItem("wadi-lang", data.language);
      if (data.theme) localStorage.setItem("wadi-theme", data.theme);
      if (data.custom_instructions)
        localStorage.setItem("wadi-prompt", data.custom_instructions);

      // Apply theme side-effect immediately
      const root = window.document.documentElement;
      const theme = data.theme || "system";
      if (theme === "system") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.classList.toggle("dark", isDark);
      } else {
        root.classList.toggle("dark", theme === "dark");
      }
    }
  },

  // --- GENERAL ---
  setSystemPrompt: (prompt) => {
    set({ systemPrompt: prompt });
    localStorage.setItem("wadi-prompt", prompt);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ custom_instructions: prompt })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Error saving prompt:", error);
          });
      }
    });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem("wadi-lang", lang);

    // Sync with Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ language: lang })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Error saving language:", error);
          });
      }
    });
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("wadi-theme", theme);

    // UI Update
    const root = window.document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }

    // Sync with Supabase
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ theme: theme })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Error saving theme:", error);
          });
      }
    });
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
