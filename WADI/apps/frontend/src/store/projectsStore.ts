import { create } from "zustand";
import { supabase } from "../config/supabase";
import { fetchWithRetry } from "../utils/api";

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
}

const rawUrl = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("No authenticated session (Please login)");

      const res = await fetchWithRetry(`${API_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Respuesta inválida del servidor (no es JSON)");
      }

      const data = await res.json();
      // Handle unified response shape if GET returns wrapped data?
      // My backend routes.js returns `res.json(data)` (array), NOT `{ ok: true, data: [] }`.
      // Only errors are wrapped. So straight array for data.
      set({ projects: data, loading: false });
    } catch (e) {
      console.error("Failed to fetch projects", e);
      set({ loading: false });
      // Might want to expose error in store? But interface doesn't have it.
    }
  },

  createProject: async (name, description) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetchWithRetry(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor devolvió un error inesperado (HTML).");
      }

      const data = await res.json();
      set((state) => ({ projects: [data, ...state.projects] }));
    } catch (e) {
      console.error("Failed to create project", e);
      throw e;
    }
  },
}));
