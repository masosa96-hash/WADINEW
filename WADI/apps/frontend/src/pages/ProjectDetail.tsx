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

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "";

async function fetchProjectById(id: string, token: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch project: ${res.status}`);
  return res.json();
}

async function patchProjectStructure(
  id: string,
  token: string,
  structure: ProjectStructure,
  signal?: AbortSignal
): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${id}/structure`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ structure }),
    signal,
  });
  if (!res.ok) throw new Error("Failed to save structure");
  const data = await res.json();
  return data.project as Project;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Editable Text Field ──────────────────────────────────────────────────────

function EditableText({
  value,
  onSave,
  label,
}: {
  value: string;
  onSave: (val: string) => void;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value) onSave(draft.trim());
  };

  return editing ? (
    <textarea
      className="w-full bg-wadi-base border border-wadi-accent/50 rounded p-2 text-sm font-mono text-wadi-text resize-none focus:outline-none focus:border-wadi-accent"
      rows={3}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) commit(); }}
      autoFocus
      aria-label={`Editar ${label}`}
    />
  ) : (
    <p
      className="text-sm font-mono text-wadi-text cursor-pointer hover:text-wadi-accent transition-colors group"
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click para editar"
    >
      {value}
      <span className="ml-2 text-[9px] text-wadi-muted/40 uppercase group-hover:text-wadi-accent/60">edit</span>
    </p>
  );
}

// ─── Editable List ───────────────────────────────────────────────────────────

function EditableList({
  items,
  onSave,
  label,
  color,
}: {
  items: string[];
  onSave: (items: string[]) => void;
  label: string;
  color?: string;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<string[]>(items);

  const commit = (i: number) => {
    setEditing(null);
    const updated = [...drafts];
    if (updated[i].trim() === "") {
      updated.splice(i, 1);
    }
    setDrafts(updated);
    onSave(updated);
  };

  const addItem = () => {
    const updated = [...drafts, ""];
    setDrafts(updated);
    setEditing(updated.length - 1);
  };

  return (
    <ul className="space-y-1">
      {drafts.map((item, i) =>
        editing === i ? (
          <li key={i}>
            <input
              className="w-full bg-wadi-base border border-wadi-accent/50 rounded px-2 py-1 text-sm font-mono text-wadi-text focus:outline-none focus:border-wadi-accent"
              value={drafts[i]}
              onChange={(e) => {
                const u = [...drafts];
                u[i] = e.target.value;
                setDrafts(u);
              }}
              onBlur={() => commit(i)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(i); if (e.key === "Escape") setEditing(null); }}
              autoFocus
              aria-label={`Editar ${label} ${i + 1}`}
            />
          </li>
        ) : (
          <li
            key={i}
            className={`text-sm font-mono cursor-pointer hover:opacity-80 transition-opacity flex items-start gap-2 group ${color || "text-wadi-text/90"}`}
            onClick={() => setEditing(i)}
          >
            <span className="mt-0.5 shrink-0">›</span>
            <span>{item}</span>
            <span className="ml-auto text-[9px] text-wadi-muted/30 uppercase group-hover:text-wadi-accent/50 shrink-0">edit</span>
          </li>
        )
      )}
      <li>
        <button
          onClick={addItem}
          className="text-[10px] font-mono text-wadi-muted/50 hover:text-wadi-accent transition-colors uppercase tracking-widest mt-1"
        >
          + agregar
        </button>
      </li>
    </ul>
  );
}

// ─── Structure Card ───────────────────────────────────────────────────────────

function StructureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-wadi-border/50 rounded-lg p-4 bg-wadi-surface/30 space-y-2">
      <h3 className="text-[10px] font-mono text-wadi-accent uppercase tracking-widest">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// ─── Structure View (editable) ────────────────────────────────────────────────

function StructureView({
  project,
  onRetry,
  onStructureChange,
}: {
  project: Project;
  onRetry: () => void;
  onStructureChange: (updated: ProjectStructure) => void;
}) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (updated: ProjectStructure) => {
      onStructureChange(updated);
      setSaveStatus("saving");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => setSaveStatus("saved"), 500);
    },
    [onStructureChange]
  );

  if (project.status === "STRUCTURE_FAILED") {
    return (
      <div className="w-full max-w-3xl mx-auto py-10 px-4 text-center space-y-4">
        <p className="text-xs font-mono text-wadi-error uppercase tracking-widest">
          ERROR: Estructuración fallida
        </p>
        <p className="text-xs text-wadi-muted font-mono">
          WADI no pudo generar la estructura. Podés reintentar o empezar a trabajar directamente.
        </p>
        <button onClick={onRetry} className="btn-primary text-xs py-2 px-6">
          REINTENTAR
        </button>
      </div>
    );
  }

  const s = project.structure;
  if (!s || !s.problem) return null;

  const update = (patch: Partial<ProjectStructure>) =>
    save({ ...s, ...patch });

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-4 space-y-4">
      {/* Header */}
      <div className="mb-4 border-b border-wadi-border/30 pb-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-wadi-accent uppercase tracking-widest mb-1">
            Project Brief · v{project.structure_version ?? 1}
          </p>
          <h2 className="text-lg font-mono font-bold text-wadi-text">{project.name}</h2>
          <p className="text-[10px] text-gray-400 mt-2 italic font-sans">
            Este es un borrador inicial. Ajustalo hasta que sientas que es tuyo.
          </p>
        </div>
        <span className={`text-[9px] font-mono uppercase tracking-widest transition-colors ${
          saveStatus === "saving" ? "text-wadi-muted animate-pulse" :
          saveStatus === "saved"  ? "text-wadi-accent" :
          saveStatus === "error"  ? "text-wadi-error" : "text-transparent"
        }`}>
          {saveStatus === "saving" ? "guardando…" : saveStatus === "saved" ? "✓ guardado" : saveStatus === "error" ? "error al guardar" : "·"}
        </span>
      </div>

      {/* Text fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StructureCard title="Problem">
          <EditableText value={s.problem} label="Problem" onSave={(v) => update({ problem: v })} />
        </StructureCard>
        <StructureCard title="Solution">
          <EditableText value={s.solution} label="Solution" onSave={(v) => update({ solution: v })} />
        </StructureCard>
        <StructureCard title="Target ICP">
          <EditableText value={s.target_icp} label="ICP" onSave={(v) => update({ target_icp: v })} />
        </StructureCard>
        <StructureCard title="Value Proposition">
          <EditableText value={s.value_proposition} label="Value Proposition" onSave={(v) => update({ value_proposition: v })} />
        </StructureCard>
        <StructureCard title="Recommended Stack">
          <EditableText value={s.recommended_stack} label="Stack" onSave={(v) => update({ recommended_stack: v })} />
        </StructureCard>
      </div>

      {/* Milestones */}
      <StructureCard title="Milestones">
        <EditableList
          items={s.milestones}
          label="Milestone"
          onSave={(items) => update({ milestones: items })}
        />
      </StructureCard>

      {/* Risks + Validation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StructureCard title="Risks">
          <EditableList
            items={s.risks}
            label="Risk"
            color="text-wadi-error/80"
            onSave={(items) => update({ risks: items })}
          />
        </StructureCard>
        <StructureCard title="Validation Steps">
          <EditableList
            items={s.validation_steps}
            label="Validation Step"
            onSave={(items) => update({ validation_steps: items })}
          />
        </StructureCard>
      </div>

      <div className="pt-2 border-t border-wadi-border/20">
        <p className="text-[9px] font-mono text-wadi-muted/40 uppercase tracking-widest text-center">
          Crystallize v{project.structure_version ?? 1} · Click en cualquier campo para editar
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
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadProject = useCallback(async () => {
    if (!id || !session?.access_token) return;
    try {
      const p = await fetchProjectById(id, session.access_token);
      setProject(p);
      return p;
    } catch {
      // silently ignore
    } finally {
      setProjectLoading(false);
    }
  }, [id, session?.access_token]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      if (!id || !session?.access_token) return;
      try {
        const p = await fetchProjectById(id, session.access_token);
        setProject(p);
        if (p.status !== "GENERATING_STRUCTURE") stopPolling();
      } catch { stopPolling(); }
    }, 2000);
  }, [id, session?.access_token, stopPolling]);

  useEffect(() => {
    if (id) fetchRuns(id);
    return () => clearRuns();
  }, [id, fetchRuns, clearRuns]);

  useEffect(() => {
    loadProject().then((p) => {
      if (p?.status === "GENERATING_STRUCTURE") startPolling();
    });
    return () => stopPolling();
  }, [loadProject, startPolling, stopPolling]);

  // Edición inline: debounce 600ms + AbortController para cancelar request anterior en-flight
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStructureChange = useCallback(
    (updated: ProjectStructure) => {
      if (!id || !session?.access_token) return;
      // Optimistic update — UI refleja el cambio instantáneamente
      setProject((prev) => prev ? { ...prev, structure: updated } : prev);
      // Cancel any pending in-flight request
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        try {
          const saved = await patchProjectStructure(id, session.access_token!, updated, controller.signal);
          // Sync structure_version from server response
          setProject((prev) => prev ? { ...prev, structure_version: saved.structure_version } : prev);
        } catch (e: unknown) {
          if (e instanceof Error && e.name !== "AbortError") {
            console.error("[STRUCTURE SAVE]", e);
          }
        }
      }, 600);
    },
    [id, session?.access_token]
  );

  const handleRetryCrystallize = useCallback(async () => {
    if (!project || !session?.access_token) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/crystallize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: project.name, description: project.description }),
      });
      if (res.ok) {
        setProject((prev) => prev ? { ...prev, status: "GENERATING_STRUCTURE" } : prev);
        startPolling();
      }
    } catch { /* ignore */ }
  }, [project, session?.access_token, startPolling]);

  const handleRun = async (input: string) => {
    if (id) {
      await createRun(id, input);
      fetchRuns(id);
      setTimeout(scrollToBottom, 100);
    }
  };

  // ─── Crystallize status check ─────────────────────────────────────────────

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
          <StructureView
            project={project}
            onRetry={handleRetryCrystallize}
            onStructureChange={handleStructureChange}
          />
        )}
      </div>
    );
  }

  // ─── Default: runs view ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-transparent relative p-4 lg:p-6 overflow-hidden">
      <div className="absolute top-4 right-4 z-40 opacity-0 hover:opacity-100 transition-opacity">
        <div className="text-[10px] font-mono text-wadi-muted/20 uppercase tracking-widest text-right">
          CTX :: {id?.slice(0, 8)} <br />
          {loading ? "BUSY" : "READY"}
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
          <RunInputForm onSubmit={handleRun} loading={loading} />
        </div>
      </div>
    </div>
  );
}
