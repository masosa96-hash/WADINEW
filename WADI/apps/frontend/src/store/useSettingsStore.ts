import { create } from "zustand";
import { supabase } from "../config/supabase";

interface SettingsState {
  theme: "light" | "dark" | "system";
  language: "es" | "en";
  customInstructions: string;
  updateSettings: (
    updates: Partial<Omit<SettingsState, "updateSettings">>
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: "system",
  language: "es",
  customInstructions: "",

  updateSettings: async (updates) => {
    // Optimistic Update
    set({ ...get(), ...updates });

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    // Persist to DB (Profile table must have matching columns or this will error, but following instructions)
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);
    if (error) {
      console.error("Failed to persist settings:", error);
    }
  },
}));
