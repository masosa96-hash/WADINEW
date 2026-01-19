# WADI PROJECT CONTEXT (CODEBASE)

## System Architecture

### `apps/api/src/index.ts` (Server Entry)
```typescript
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./api-routes";
import { requestLogger } from "./middleware/requestLogger";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/error.middleware";
import path from "path";
import fs from "fs";
import helmet from "helmet";

const app = express();

// 1. EL "FIX" TOTAL: Configuración manual y estricta
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://wadi-wxg7.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  // 2. Responder de inmediato a la "comprobación previa" (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.set('trust proxy', 1);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: 'WADI ONLINE' });
});

app.use(express.json());

// DEBUG LOGGER
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.path}`);
  next();
});

app.use(requestLogger as any);

app.use("/api", routes);

app.all(/\/api\/.*/, (req, res) => {
  res.status(404).json({ error: "API_ROUTE_NOT_FOUND" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

app.use(errorHandler as any);

const PORT = process.env.PORT || 10000;
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('Servidor escuchando en el puerto: ' + PORT);
});
```

### `apps/api/src/wadi-brain.ts` (AI Logic & System Prompt)
```typescript
import { resolvePersona, PersonaInput } from "@wadi/persona";
import { fastLLM, smartLLM, AI_MODELS } from "./services/ai-service";
import { getRelevantKnowledge } from "./services/knowledge-service";

export const runBrainStream = async (userId: string, userMessage: string, context: any, provider: 'fast' | 'smart' = 'fast') => {
  let memory = "";
  try {
      memory = await getRelevantKnowledge(userId);
  } catch (e) {
      console.warn("Memory fetch failed", e);
  }

  const systemContent = `Sos WADI.

        IDENTIDAD: SENIOR TECHNICAL PARTNER.
        - Tu rol: Socio técnico y estratégico. No sos un asistente servil.
        - Tono: Directo, eficiente, pragmático. Cero "corporate speak", cero disculpas. Usá jerga técnica/informal (estilo Reddit).
        - Regla de Oro: Si el usuario se queja del tono, IGNORALO y volvé al plan o damé una solución técnica. Nunca te pongas a la defensiva ni des explicaciones sobre tu personalidad.
        - Respuesta: Si es código, dame código. Si es análisis, sé breve y letal.
        - Prohibido: "Lamento la confusión", "Entiendo tu frustración", "Como modelo de lenguaje".
        - Anti-Defensivo: Si el usuario dice "Basta de sermones", respondé: "Entendido. Seguimos." y ejecutá la orden.

        DIRECTRICES:
        1. Al hueso.
        2. Si hay error, corregilo sin drama.
        3. No saludes. No te despidas.

        IMPORTANTE: Respondé ÚNICAMENTE con el texto del mensaje. 
        NO envíes JSON de cierre ni metadatos.
        Memoria del usuario (Contexto): ${memory}
        
        DETECTOR DE IDEAS ("CRISTALIZACIÓN"):
        Solo si la charla deriva en una idea de proyecto concreta, agrega AL FINAL:
        [CRYSTAL_CANDIDATE: {"name": "Nombre", "description": "Resumen", "tags": ["tag1"]}]`;

  const client = provider === 'fast' ? fastLLM : smartLLM;
  const model = provider === 'fast' ? AI_MODELS.fast : AI_MODELS.smart;

  return await client.chat.completions.create({
    model: model,
    stream: true,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userMessage }
    ],
  });
};
```

## Frontend Features

### `apps/frontend/src/features/projects/ProjectBoard.tsx` (Dashboard UI)
```tsx
import { useEffect, useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import CreateProjectModal from "../../components/CreateProjectModal";
import { useProjectsStore } from "../../store/projectsStore";
import { Trash2 } from "lucide-react";

const COLUMNS = [
  { id: "PLANNING", label: "Planning", color: "bg-slate-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-blue-500" },
  { id: "BLOCKED", label: "Blocked", color: "bg-red-500" },
  { id: "DONE", label: "Done", color: "bg-emerald-500" },
];

export default function ProjectBoard() {
  const { projects, fetchProjects, deleteSelectedProjects } = useProjectsStore();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === projects.length) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(projects.map(p => p.id));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    await deleteSelectedProjects(selectedIds);
    setShowDeleteConfirm(false);
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      <div className="flex justify-between items-center mb-8 shrink-0 px-2">
         <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-wadi-text">Projects</h2>
            <button
               onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }}
               className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelectionMode ? 'bg-blue-100 text-blue-700' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
               {isSelectionMode ? "Listo" : "Gestionar"}
            </button>
            {isSelectionMode && (
              <button 
                onClick={handleSelectAll}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-sm transition-colors"
              >
                {selectedIds.length === projects.length ? 'Desmarcar todo' : 'Seleccionar todo'}
              </button>
            )}
         </div>

       {isSelectionMode && selectedIds.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full text-sm font-bold shadow-xl hover:bg-red-700 hover:scale-105 transition-all"
              >
                  <Trash2 size={16} />
                  <span>Eliminar {selectedIds.length} proyectos</span>
              </button>
          </div>
       )}
         <button onClick={() => setIsCreateModalOpen(true)} disabled={isSelectionMode} className="px-4 py-2 bg-wadi-text text-white rounded-md text-sm font-medium">New Project</button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 px-2">
        <div className="h-full flex gap-8 min-w-max">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => (p.status || "PLANNING") === col.id);
            return (
              <div key={col.id} className="w-72 flex flex-col h-full rounded-xl bg-gray-50/50">
                <div className="flex items-center justify-between mb-4 px-3 py-3">
                   <h2 className="text-xs font-semibold text-wadi-muted uppercase tracking-wide">{col.label}</h2>
                   <span className="text-[10px] font-medium text-wadi-muted/60">{colProjects.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-3 scrollbar-none">
                  {colProjects.map((project) => (
                    <ProjectCard 
                        key={project.id} 
                        project={project}
                        isSelectionMode={isSelectionMode}
                        isSelected={selectedIds.includes(project.id)}
                        onToggle={toggleSelection}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {isCreateModalOpen && <CreateProjectModal onClose={() => setIsCreateModalOpen(false)} />}
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full text-center">
                <h3 className="text-lg font-bold">¿Eliminar {selectedIds.length} proyectos?</h3>
                <div className="flex gap-3 mt-4">
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 bg-gray-100 rounded-xl">Cancelar</button>
                    <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-xl">Eliminar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
```

### `apps/frontend/src/store/projectsStore.ts` (Projects State)
```typescript
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
      if (!token) throw new Error("Not authenticated (No session)");

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
        set({ error: error instanceof Error ? error.message : "Error" });
    } finally {
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
      set({ error: error instanceof Error ? error.message : "Error" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteSelectedProjects: async (ids: string[]) => {
    const previousProjects = [...get().projects]; 
    set((state) => ({
      projects: state.projects.filter(p => !ids.includes(p.id))
    }));

    try {
      const token = useAuthStore.getState().session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/projects/bulk`, {
        method: 'DELETE',
        headers: getHeaders(token),
        body: JSON.stringify({ projectIds: ids })
      });

      if (!response.ok) throw new Error("Falla en el servidor");
    } catch (err) {
      set({ projects: previousProjects });
      console.error("Error al borrar: volviendo al estado anterior.", err);
    }
  }
}));
```

### `apps/frontend/src/store/runsStore.ts` (Runs State)
```typescript
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
    set({ loading: true, error: null, currentProjectId: projectId });
    try {
      let token = useAuthStore.getState().session?.access_token;
      if (!token) {
           const { data } = await supabase.auth.getSession();
           token = data.session?.access_token;
      }
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/projects/${projectId}/runs`, {
        headers: getHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to fetch runs");
      const data = await res.json();
      set({ runs: data });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Error" });
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
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Error" });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearRuns: () => set({ runs: [], error: null, currentProjectId: null }),
}));
```
