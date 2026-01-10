import { create } from "zustand";
import { API_URL, getHeaders } from "../config/api";
import { useAuthStore } from "./authStore";

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
    set({ loading: true, error: null, currentProjectId: projectId });
    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      // Uses the route: GET /api/projects/:id/runs
      // Note: runsRouter uses /projects/:id/runs but mounted at /api
      // So path is /api/projects/:id/runs
      const res = await fetch(`${API_URL}/projects/${projectId}/runs`, {
        headers: getHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch runs");

      const data = await res.json();
      set({ runs: data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createRun: async (projectId: string, input: string, model?: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/projects/${projectId}/runs`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ input, model }),
      });

      if (!res.ok) throw new Error("Failed to create run");

      const newRun = await res.json();
      set((state) => ({ runs: [newRun, ...state.runs] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearRuns: () => set({ runs: [], error: null, currentProjectId: null }),
}));
