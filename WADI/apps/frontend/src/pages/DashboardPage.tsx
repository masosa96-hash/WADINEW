import { Link } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useDocumentStore } from "../store/documentStore";
import { AuditorHeader } from "../components/auditor/AuditorHeader";
import {
  LayoutDashboard,
  Brain,
  Files,
  Activity,
  Trash2,
  ExternalLink,
  ChevronRight,
  Database,
  Cpu,
  Layers,
} from "lucide-react";

// Helper Card Component
const DashboardCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  action,
}: {
  title: string;
  icon: React.ElementType; // Fixed 'any' type
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) => (
  <div
    className={`bg-[var(--wadi-surface)] border border-[var(--wadi-border)] rounded-lg p-5 flex flex-col h-full relative overflow-hidden group hover:border-[var(--wadi-primary)]/50 transition-colors duration-300 ${className}`}
  >
    <div className="flex items-center justify-between mb-4 border-b border-[var(--wadi-border)]/50 pb-2">
      <div className="flex items-center gap-2 text-[var(--wadi-text)]">
        <Icon size={18} className="text-[var(--wadi-primary)]" />
        <h3 className="font-mono-wadi text-xs font-bold uppercase tracking-widest">
          {title}
        </h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
      {children}
    </div>
    {/* Decorative background element */}
    <div className="absolute -bottom-4 -right-4 text-[var(--wadi-primary)]/5 group-hover:text-[var(--wadi-primary)]/10 transition-colors duration-500 pointer-events-none transform rotate-12">
      <Icon size={120} />
    </div>
  </div>
);

export default function DashboardPage() {
  const {
    workspaces,
    activeWorkspaceId,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    messages,
    memory,
    forget,
    points,
  } = useChatStore();

  const { documents, removeDocument, clearDocuments } = useDocumentStore();

  // Derived state (no need for useEffect/useState)
  const memoryItems = Object.entries(memory);

  const userMsgs = messages.filter((m) => m.role === "user");
  const sysMsgs = messages.filter((m) => m.role === "assistant");

  const stats = {
    totalMessages: messages.length,
    userMessages: userMsgs.length,
    systemMessages: sysMsgs.length,
  };

  const handleDeleteWorkspace = (name: string) => {
    if (
      confirm(
        `¿Eliminar contexto '${name}'? Perderás todo el historial asociado.`
      )
    ) {
      deleteWorkspace(name);
    }
  };

  const handleForget = () => {
    if (
      confirm(
        "¿Borrar toda la memoria a largo plazo? WADI olvidará todo lo que le enseñaste."
      )
    ) {
      forget();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f111a] text-white overflow-hidden">
      <AuditorHeader />

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-mono-wadi text-[var(--wadi-primary)] mb-1 flex items-center gap-3">
                <LayoutDashboard className="animate-pulse-soft" /> PANEL DE
                CONTROL
              </h1>
              <p className="text-sm text-[var(--wadi-text-muted)] max-w-2xl">
                Visualización de estado interno. No rompas nada. O sí, no soy tu
                padre.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/chat"
                className="px-4 py-2 bg-[var(--wadi-primary)] text-black font-mono-wadi font-bold text-xs uppercase rounded flex items-center gap-2 hover:bg-[var(--wadi-primary)]/90 transition-all shadow-[0_0_15px_rgba(var(--wadi-primary-rgb),0.3)]"
              >
                Volver al Chat <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--wadi-text-muted)] uppercase tracking-wider font-mono-wadi">
                  Interacciones
                </div>
                <div className="text-2xl font-bold font-mono">
                  {stats.totalMessages}
                </div>
              </div>
            </div>
            <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                <Brain size={24} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--wadi-text-muted)] uppercase tracking-wider font-mono-wadi">
                  Memoria (Items)
                </div>
                <div className="text-2xl font-bold font-mono">
                  {memoryItems.length}
                </div>
              </div>
            </div>
            <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                <Files size={24} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--wadi-text-muted)] uppercase tracking-wider font-mono-wadi">
                  Docs Ingeridos
                </div>
                <div className="text-2xl font-bold font-mono">
                  {documents.length}
                </div>
              </div>
            </div>
            <div className="bg-[var(--wadi-surface)] border border-[var(--wadi-border)] p-4 rounded flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
                <Cpu size={24} />
              </div>
              <div>
                <div className="text-[10px] text-[var(--wadi-text-muted)] uppercase tracking-wider font-mono-wadi">
                  Eficiencia WADI
                </div>
                <div className="text-2xl font-bold font-mono">
                  {points} <span className="text-[10px] opacity-70">PTS</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Workspaces Column */}
            <div className="md:col-span-1 h-full">
              <DashboardCard
                title="Contextos (Workspaces)"
                icon={Layers}
                action={
                  <button
                    onClick={() => createWorkspace("Nuevo Contexto")}
                    className="text-[10px] text-[var(--wadi-primary)] hover:underline"
                  >
                    + NUEVO
                  </button>
                }
              >
                <div className="space-y-2">
                  {workspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className={`p-3 rounded border border-[var(--wadi-border)] flex items-center justify-between group transition-all ${
                        activeWorkspaceId === ws.id
                          ? "bg-[var(--wadi-primary)]/10 border-[var(--wadi-primary)]"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="flex-1 truncate">
                        <div className="font-bold text-sm truncate">
                          {ws.name}
                        </div>
                        <div className="text-[10px] text-[var(--wadi-text-muted)]">
                          ID: {ws.id.slice(0, 8)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeWorkspaceId !== ws.id && (
                          <button
                            onClick={() => switchWorkspace(ws.name)}
                            className="p-1.5 hover:bg-white/10 rounded text-[var(--wadi-success)]"
                            title="Cambiar a este workspace"
                          >
                            <ExternalLink size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteWorkspace(ws.name)}
                          className="p-1.5 hover:bg-white/10 rounded text-[var(--wadi-tension)]"
                          title="Eliminar workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {workspaces.length === 0 && (
                    <div className="text-center py-8 text-[var(--wadi-text-muted)] text-sm italic">
                      No hay contextos definidos. Estás flotando en la nada.
                    </div>
                  )}
                </div>
              </DashboardCard>
            </div>

            {/* Memory & Docs Column */}
            <div className="md:col-span-2 grid grid-rows-2 gap-6 h-full">
              {/* Memory Section */}
              <DashboardCard
                title="Memoria Asociativa (LTM)"
                icon={Database}
                className="h-full"
                action={
                  memoryItems.length > 0 && (
                    <button
                      onClick={handleForget}
                      className="text-[10px] text-[var(--wadi-tension)] hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={10} /> PURGAR MEMORIA
                    </button>
                  )
                }
              >
                {memoryItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {memoryItems.map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-black/20 p-3 rounded border border-[var(--wadi-border)] text-sm overflow-hidden"
                      >
                        <div className="text-[var(--wadi-primary)] font-bold text-xs uppercase mb-1">
                          {key}
                        </div>
                        <div
                          className="text-[var(--wadi-text-muted)] line-clamp-2"
                          title={value}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--wadi-text-muted)] opacity-50">
                    <Brain size={48} className="mb-2" />
                    <p className="text-sm">Tabula Rasa. No sé nada.</p>
                  </div>
                )}
              </DashboardCard>

              {/* Documents Section */}
              <DashboardCard
                title="Archivos Ingeridos"
                icon={Files}
                className="h-full"
                action={
                  documents.length > 0 && (
                    <button
                      onClick={() => {
                        if (
                          confirm("¿Eliminar todos los documentos indexados?")
                        )
                          clearDocuments();
                      }}
                      className="text-[10px] text-[var(--wadi-tension)] hover:underline flex items-center gap-1"
                    >
                      <Trash2 size={10} /> LIMPIAR ÍNDICE
                    </button>
                  )
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-[var(--wadi-text-muted)] font-mono-wadi border-b border-[var(--wadi-border)]">
                      <tr>
                        <th className="py-2 pl-2">ARCHIVO</th>
                        <th className="py-2">TOKENS</th>
                        <th className="py-2">TAMAÑO</th>
                        <th className="py-2">FECHA</th>
                        <th className="py-2 text-right pr-2">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--wadi-border)]/30">
                      {documents.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-white/5 transition-colors"
                        >
                          <td
                            className="py-2 pl-2 font-medium text-[var(--wadi-text)] truncate max-w-[200px]"
                            title={doc.filename}
                          >
                            {doc.filename}
                          </td>
                          <td className="py-2 text-[var(--wadi-text-muted)] font-mono">
                            {doc.tokens}
                          </td>
                          <td className="py-2 text-[var(--wadi-text-muted)] font-mono">
                            {(doc.size / 1024).toFixed(1)} KB
                          </td>
                          <td className="py-2 text-[var(--wadi-text-muted)]">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 text-right pr-2">
                            <button
                              onClick={() => removeDocument(doc.id)}
                              className="text-[var(--wadi-tension)] hover:text-red-400 p-1"
                              title="Eliminar del índice"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {documents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-[var(--wadi-text-muted)] opacity-50">
                      <Files size={32} className="mb-2" />
                      <p className="text-sm">
                        El índice está vacío. Arrastra archivos en el chat para
                        popular.
                      </p>
                    </div>
                  )}
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
