import { create } from "zustand";
import { supabase } from "../config/supabase";
import { fetchWithRetry } from "../utils/api";

interface Run {
  id: string;
  input: string;
  output: string;
  created_at: string;
}

interface RunsState {
  runs: Run[];
  loading: boolean;
  fetchRuns: (projectId: string) => Promise<void>;
  createRun: (projectId: string, input: string) => Promise<void>;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useRunsStore = create<RunsState>((set) => ({
  runs: [],
  loading: false,

  fetchRuns: async (projectId) => {
    set({ loading: true });

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetchWithRetry(
        `${API_URL}/api/projects/${projectId}/runs`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.error?.message || err.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const data = await res.json();
      set({ runs: data, loading: false });
    } catch (e) {
      console.error("Failed to fetch runs", e);
      set({ loading: false });
    }
  },

  createRun: async (projectId, input) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetchWithRetry(
        `${API_URL}/api/projects/${projectId}/runs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ input }),
        }
      );

      if (!res.ok) {
        let msg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          msg = err.error?.message || err.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const data = await res.json();
      set((state) => ({ runs: [data, ...state.runs] }));
    } catch (e) {
      console.error("Failed to create run", e);
      throw e;
    }
  },
}));
