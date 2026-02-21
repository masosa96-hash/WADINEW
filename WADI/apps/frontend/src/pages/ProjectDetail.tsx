import { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";
import { useAuthStore } from "../store/useAuthStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectStructure {
  problem: string;
  solution: string;
  target_icp: string;
  value_proposition: string;
  recommended_stack: string;
  milestones: string[];
  risks: string[];
  validation_steps: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  structure?: ProjectStructure;
  structure_version?: number;
  created_at: string;
  updated_at?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "";

async function fetchProjectById(id: string, token: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StructureSkeleton() {
  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-4 animate-pulse space-y-6">
      <div className="text-center space-y-2">
        <div className="h-4 bg-wadi-border/40 rounded w-48 mx-auto" />
        <p className="text-xs font-mono text-wadi-accent tracking-widest uppercase">
          WADI está estructurando tu idea…
        </p>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 bg-wadi-border/40 rounded w-24" />
          <div className="h-4 bg-wadi-surface/80 rounded w-full border border-wadi-border/20" />
        </div>
      ))}
    </div>
  );
}

function StructureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-wadi-border/50 rounded-lg p-4 bg-wadi-surface/30 space-y-2">
      <h3 className="text-[10px] font-mono text-wadi-accent uppercase tracking-widest">{title}</h3>
      <div className="text-sm text-wadi-text font-mono">{children}</div>
    </div>
  );
}

function StructureView({ project, onRetry }: { project: Project; onRetry: () => void }) {
  if (project.status === "STRUCTURE_FAILED") {
    return (
      <div className="w-full max-w-3xl mx-auto py-10 px-4 text-center space-y-4">
        <p className="text-xs font-mono text-wadi-error uppercase tracking-widest">
          ERROR: Estructuración fallida
        </p>
        <p className="text-xs text-wadi-muted font-mono">
          WADI no pudo generar la estructura. Podés reintentar o empezar a trabajar directamente.
        </p>
        <button
          onClick={onRetry}
          className="btn-primary text-xs py-2 px-6"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  const s = project.structure;
  if (!s || !s.problem) return null;

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-4">
      <div className="mb-6 border-b border-wadi-border/30 pb-4">
        <p className="text-[10px] font-mono text-wadi-accent uppercase tracking-widest mb-1">
          Project Brief · v{project.structure_version ?? 1}
        </p>
        <h2 className="text-lg font-mono font-bold text-wadi-text">{project.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StructureCard title="Problem">
          {s.problem}
        </StructureCard>
        <StructureCard title="Solution">
          {s.solution}
        </StructureCard>
        <StructureCard title="Target ICP">
          {s.target_icp}
        </StructureCard>
        <StructureCard title="Value Proposition">
          {s.value_proposition}
        </StructureCard>
        <StructureCard title="Recommended Stack">
          {s.recommended_stack}
        </StructureCard>
      </div>

      <StructureCard title="Milestones">
        <ol className="list-decimal list-inside space-y-1">
          {s.milestones.map((m, i) => (
            <li key={i} className="text-wadi-text/90">{m}</li>
          ))}
        </ol>
      </StructureCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StructureCard title="Risks">
          <ul className="list-disc list-inside space-y-1">
            {s.risks.map((r, i) => (
              <li key={i} className="text-wadi-error/80">{r}</li>
            ))}
          </ul>
        </StructureCard>
        <StructureCard title="Validation Steps">
          <ul className="list-disc list-inside space-y-1">
            {s.validation_steps.map((v, i) => (
              <li key={i} className="text-wadi-text/80">{v}</li>
            ))}
          </ul>
        </StructureCard>
      </div>

      <div className="pt-2 border-t border-wadi-border/20">
        <p className="text-[9px] font-mono text-wadi-muted/40 uppercase tracking-widest text-center">
          Estructura generada por WADI · Crystallize v{project.structure_version ?? 1}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();
  const { session } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadProject = useCallback(async () => {
    if (!id || !session?.access_token) return;
    try {
      const p = await fetchProjectById(id, session.access_token);
      setProject(p);
      return p;
    } catch {
      // silently ignore, fallback to run view
    } finally {
      setProjectLoading(false);
    }
  }, [id, session?.access_token]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      if (!id || !session?.access_token) return;
      try {
        const p = await fetchProjectById(id, session.access_token);
        setProject(p);
        if (p.status !== "GENERATING_STRUCTURE") {
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    }, 2000);
  }, [id, session?.access_token, stopPolling]);

  useEffect(() => {
    if (id) fetchRuns(id);
    return () => clearRuns();
  }, [id, fetchRuns, clearRuns]);

  useEffect(() => {
    loadProject().then((p) => {
      if (p?.status === "GENERATING_STRUCTURE") {
        startPolling();
      }
    });
    return () => stopPolling();
  }, [loadProject, startPolling, stopPolling]);

  const handleRetryCrystallize = useCallback(async () => {
    if (!project || !session?.access_token) return;
    try {
      await fetch(`${API_BASE}/api/projects/crystallize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: project.name, description: project.description }),
      });
      // Navigate to new project? For now just re-poll current
      setProject((prev) => prev ? { ...prev, status: "GENERATING_STRUCTURE" } : prev);
      startPolling();
    } catch {/* ignore */}
  }, [project, session?.access_token, startPolling]);

  const handleRun = async (input: string) => {
    if (id) {
      await createRun(id, input);
      fetchRuns(id);
      setTimeout(scrollToBottom, 100);
    }
  };

  // ─── Crystallize rendering ─────────────────────────────────────────────────

  const isCrystallized =
    project &&
    (project.status === "GENERATING_STRUCTURE" ||
      project.status === "READY" ||
      project.status === "STRUCTURE_FAILED");

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs font-mono text-wadi-muted animate-pulse">LOADING PROJECT…</p>
      </div>
    );
  }

  if (isCrystallized) {
    return (
      <div className="flex flex-col h-full bg-transparent overflow-y-auto">
        {project.status === "GENERATING_STRUCTURE" && <StructureSkeleton />}
        {(project.status === "READY" || project.status === "STRUCTURE_FAILED") && (
          <StructureView project={project} onRetry={handleRetryCrystallize} />
        )}
      </div>
    );
  }

  // ─── Default: runs view (pre-Crystallize projects) ─────────────────────────

  return (
    <div className="flex flex-col h-full bg-transparent relative p-4 lg:p-6 overflow-hidden">

      <div className="absolute top-4 right-4 z-40 opacity-0 hover:opacity-100 transition-opacity">
        <div className="text-[10px] font-mono text-wadi-muted/20 uppercase tracking-widest text-right">
          CTX :: {id?.slice(0, 8)} <br />
          {loading ? 'BUSY' : 'READY'}
        </div>
      </div>

      {error && (
        <div className="bg-wadi-error/10 text-wadi-error border border-wadi-error/50 p-2 rounded mb-4 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-none pb-10 mask-fade-top">
          {runs.length > 0 ? (
            <RunHistoryList runs={runs} />
          ) : (
            <div className="text-wadi-muted text-center py-8">
              No hay ejecuciones todavía. Usá el formulario abajo para crear una.
            </div>
          )}
          <div ref={bottomRef} className="h-10" />
        </div>

        <div className="shrink-0 z-20 w-full pb-6 pt-2">
          <RunInputForm
            onSubmit={handleRun}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
