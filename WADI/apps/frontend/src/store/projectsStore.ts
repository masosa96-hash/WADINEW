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
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().session?.access_token;
      
      // Sincronización de Sesión (Retry simple)
      if (!token) {
          // Intentamos esperar un poco o refrescar desde la fuente de verdad
          /* 
             NOTE: useAuthStore initialize is async but getState is sync.
             If App.tsx blocked, we should have it. If not, maybe session expired?
          */
           // console.warn("Token missing in store, checking supabase...");
           // We can't await initialize here efficiently without circular deps or side effects.
           // Better to throw a specific error that UI can handle or just rely on App blocking.
           throw new Error("Not authenticated (No session)");
      }

      const res = await fetch(`${API_URL}/projects`, {
        headers: getHeaders(token),
      });

      if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized (401)");
          throw new Error("Failed to fetch projects");
      }

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

  deleteSelectedProjects: async (ids: string[]) => {
    const previousProjects = [...get().projects]; // Backup para rollback

    // Actualización Optimista: Filtramos YA de la lista
    set((state) => ({
      projects: state.projects.filter(p => !ids.includes(p.id))
    }));

    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/projects/bulk`, {
        method: 'DELETE',
        headers: getHeaders(token), // Forzar validación de token
        body: JSON.stringify({ projectIds: ids })
      });

      if (!response.ok) throw new Error("Falla en el servidor");
    } catch (err) {
      set({ projects: previousProjects }); // Rollback si el 401 persiste
      console.error("Error al borrar: volviendo al estado anterior.", err);
    }
  }
}));
