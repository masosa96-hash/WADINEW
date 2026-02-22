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
  status: "idle" | "loading" | "success" | "error";
  errorMessage: string | null;
  currentProjectId: string | null;
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string, model?: string) => Promise<void>;
  clearRuns: () => void;
}

export const useRunsStore = create<RunsState>()((set) => ({
  runs: [],
  status: "idle",
  errorMessage: null,
  currentProjectId: null,

  fetchRuns: async (projectId: string) => {
    let token = useAuthStore.getState().session?.access_token;
    if (!token) {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }
    if (!token) return;

    set({ status: "loading", errorMessage: null, currentProjectId: projectId });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`, {
        headers: getHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch runs");
      const data = await res.json();
      set({ runs: data, status: "idle" });
    } catch (error) {
      set({ 
        status: "error", 
        errorMessage: error instanceof Error ? error.message : "An unknown error occurred" 
      });
    }
  },

  createRun: async (projectId: string, input: string, model?: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) return;

    set({ status: "loading", errorMessage: null });
    try {
      const res = await fetch(`${API_URL}/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ input, model }),
      });
      if (!res.ok) throw new Error("Failed to create run");
      const newRun = await res.json();
      set((state) => ({ runs: [newRun, ...state.runs], status: "idle" }));
    } catch (error) {
      set({ 
        status: "error", 
        errorMessage: error instanceof Error ? error.message : "An unknown error occurred" 
      });
      throw error;
    }
  },

  clearRuns: () => set({ runs: [], errorMessage: null, currentProjectId: null, status: "idle" }),
}));
