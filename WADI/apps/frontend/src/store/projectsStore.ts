import { create } from "zustand";
import { API_URL, getHeaders } from "../config/api";
import { useAuthStore } from "./authStore";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, description: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/projects`, {
        headers: getHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch projects");

      const data = await res.json();
      set({ projects: data });
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      } else {
        set({ error: "An unknown error occurred" });
      }    } finally {
      set({ loading: false });
    }
  },

  createProject: async (name: string, description: string) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ name, description, status: "PLANNING" }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const newProject = await res.json();
      set((state) => ({ projects: [newProject, ...state.projects] }));
    } catch (error) {
      if (error instanceof Error) {
        set({ error: error.message });
      } else {
        set({ error: "An unknown error occurred" });
      }
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
