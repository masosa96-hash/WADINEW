import { create } from "zustand";
import { supabase } from "../config/supabase";

interface SettingsState {
  language: string;
  theme: string;
  customInstructions: string | null; // Renamed from systemPrompt for clarity/consistency with earlier plan

  setLanguage: (lang: string) => void;
  setTheme: (theme: string) => void;
  setCustomInstructions: (instructions: string) => void; // Renamed action

  // Aliases for compatibility if needed or cleaned up
  updateSettings: (
    settings: Partial<{
      theme: string;
      language: string;
      customInstructions: string;
    }>
  ) => void;

  fetchSettings: () => Promise<void>;
  wipeAllData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: localStorage.getItem("wadi-lang") || "es",
  theme: localStorage.getItem("wadi-theme") || "system",
  customInstructions: localStorage.getItem("wadi-prompt") || "",

  fetchSettings: async () => {
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
        customInstructions: data.custom_instructions || "",
      });

      // Update LocalStorage
      if (data.language) localStorage.setItem("wadi-lang", data.language);
      if (data.theme) localStorage.setItem("wadi-theme", data.theme);
      if (data.custom_instructions)
        localStorage.setItem("wadi-prompt", data.custom_instructions);

      // Apply theme
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

  setCustomInstructions: (instructions) => {
    set({ customInstructions: instructions });
    localStorage.setItem("wadi-prompt", instructions);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ custom_instructions: instructions })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error("Error saving prompt", error);
          });
      }
    });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    localStorage.setItem("wadi-lang", lang);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ language: lang })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error(error);
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

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ theme })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) console.error(error);
          });
      }
    });
  },

  updateSettings: (newSettings) => {
    if (newSettings.theme) get().setTheme(newSettings.theme);
    if (newSettings.language) get().setLanguage(newSettings.language);
    if (newSettings.customInstructions !== undefined)
      get().setCustomInstructions(newSettings.customInstructions);
  },

  wipeAllData: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("user_id", user.id);
    if (!error) window.location.reload();
    else alert("Error wiping data: " + error.message);
  },
}));
