import { create } from "zustand";
import { API_URL, getHeaders } from "../config/api";
import { useAuthStore } from "./useAuthStore";

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
  deleteSelectedProjects: (ids: string[]) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    const token = useAuthStore.getState().session?.access_token;

    // Guests have no session → skip silently (they use ephemeral chat)
    if (!token) {
      set({ loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        headers: getHeaders(token),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized (401)");
        throw new Error("Failed to fetch projects");
      }

      const data = await res.json();
      set({ projects: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (name: string, description: string) => {
    const token = useAuthStore.getState().session?.access_token;
    if (!token) {
      // Guests cannot create persistent projects — silently no-op
      return;
    }

    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({ name, description, status: "PLANNING" }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const newProject = await res.json();
      set((state) => ({ projects: [newProject, ...state.projects] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "An unknown error occurred" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSelectedProjects: async (ids: string[]) => {
    const previousProjects = [...get().projects];

    // Optimistic update
    set((state) => ({
      projects: state.projects.filter((p) => !ids.includes(p.id)),
    }));

    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/projects/bulk`, {
        method: "DELETE",
        headers: getHeaders(token),
        body: JSON.stringify({ projectIds: ids }),
      });

      if (!response.ok) throw new Error("Falla en el servidor");
    } catch (err) {
      set({ projects: previousProjects }); // Rollback
      console.error("Error al borrar: volviendo al estado anterior.", err);
    }
  },
}));
