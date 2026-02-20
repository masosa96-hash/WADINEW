import { create } from "zustand";
import { API_URL, getHeaders } from "../config/api";
import { useAuthStore } from "./useAuthStore";
import { supabase } from "../config/supabase";

interface Run {
  id: string;
  project_id: string;
  input: string;
  output: string;
  model: string;
  created_at: string;
}

interface RunsState {
  runs: Run[];
  loading: boolean;
  error: string | null;
  currentProjectId: string | null;
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string, model?: string) => Promise<void>;
  clearRuns: () => void;
}

export const useRunsStore = create<RunsState>((set) => ({
  runs: [],
  loading: false,
  error: null,
  currentProjectId: null,

  fetchRuns: async (projectId: string) => {
    // Guests have no token and no persistent runs — skip silently
    let token = useAuthStore.getState().session?.access_token;
    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }
    if (!token) {
      set({ loading: false, error: null }); // no-op, don't wipe state
      return;
    }

    set({ loading: true, error: null, currentProjectId: projectId });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch runs");
      const data = await res.json();
      set({ runs: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  createRun: async (projectId: string, input: string, model?: string) => {
    // Guests use Chat.tsx's own streaming — this store method is for auth users only
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return; // silent no-op for guests

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ input, model }),
      });
      if (!res.ok) throw new Error("Failed to create run");
      const newRun = await res.json();
      set((state) => ({ runs: [newRun, ...state.runs] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearRuns: () => set({ runs: [], error: null, currentProjectId: null }),
}));
