import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/chatStore";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  Plus,
  LogOut,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { SettingsModal } from "./SettingsModal";
import { ConfirmModal } from "./ui/ConfirmModal";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const {
    conversations,
    fetchConversations,
    loadConversation,
    resetChat,
    setSidebarOpen,
    deleteConversation,
    fetchCriminalSummary,
    auditCount,
    riskCount,
    selectedIds,
    toggleSelection,
    selectAll,
    deleteSelectedConversations,
  } = useChatStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchCriminalSummary();
    }
  }, [user?.id, fetchConversations, fetchCriminalSummary]);

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    onClose?.();
  };

  const handleHistoryClick = (id: string) => {
    loadConversation(id);
    navigate(`/chat/${id}`);
    onClose?.();
    setSidebarOpen(false);
  };

  const onRequestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteConversation(deleteId);
    if (location.pathname.includes(deleteId)) {
      navigate("/chat");
    }
    fetchConversations();
    setDeleteId(null);
  };

  return (
    <aside
      className={`sidebar-drawer ${
        isOpen ? "open" : ""
      } flex flex-col h-full bg-[var(--bg-panel)] border-r border-[var(--border-subtle)] w-[280px] z-50 transition-transform duration-300 font-mono`}
    >
      {/* HEADER: WADI ID */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-main)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center border border-[var(--text-muted)] text-[var(--text-primary)] font-bold text-xs">
            W
          </div>
          <span className="text-sm tracking-widest text-[var(--text-primary)] font-bold">
            WADI_OS
          </span>
        </div>
        <button
          onClick={handleNewChat}
          className="w-8 h-8 flex items-center justify-center border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] text-[var(--text-secondary)] transition-colors"
          title="Nuevo Caso"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* CRIMINAL SUMMARY (EXPEDIENTE) */}
      <div className="px-4 py-3 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase text-[var(--text-muted)] tracking-widest mb-2">
          EXPEDIENTE_USUARIO
        </p>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)]">
              AUDITORÍAS
            </span>
            <span className="text-sm text-[var(--text-primary)] font-bold">
              {auditCount.toString().padStart(3, "0")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--text-secondary)]">
              RIESGOS
            </span>
            <span
              className={`text-sm font-bold flex items-center gap-1 ${
                riskCount > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"
              }`}
            >
              {riskCount.toString().padStart(3, "0")}
              {riskCount > 5 && <AlertTriangle size={12} />}
            </span>
          </div>
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto wadi-scrollbar">
        <div className="flex justify-between items-center px-4 py-2 border-b border-[var(--border-subtle)]/30 bg-[var(--bg-panel)] sticky top-0 z-10">
          <span className="text-[10px] uppercase text-[var(--text-muted)]">
            HISTORIAL_CASOS
          </span>
          {conversations.length > 0 && selectedIds.length > 0 && (
            <button
              onClick={() => deleteSelectedConversations()}
              className="text-[10px] text-[var(--danger)] hover:underline uppercase"
            >
              ELIMINAR [{selectedIds.length}]
            </button>
          )}
        </div>

        <div className="flex flex-col">
          {conversations.map((c) => {
            const isActive = location.pathname.includes(c.id);
            const isSelected = selectedIds.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => handleHistoryClick(c.id)}
                className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[var(--border-subtle)]/50 transition-colors ${
                  isActive
                    ? "bg-[var(--bg-elevated)] border-l-2 border-l-[var(--text-primary)]"
                    : "hover:bg-[var(--bg-elevated)] border-l-2 border-l-transparent"
                }`}
              >
                {/* Checkbox (Custom) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(c.id);
                  }}
                  className={`w-3 h-3 flex-shrink-0 border flex items-center justify-center ${isSelected ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--text-muted)]"}`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-[var(--bg-main)]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs truncate ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {c.title || "CASO_SIN_TITULO"}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={(e) => onRequestDelete(e, c.id)}
                  className="hidden group-hover:flex text-[var(--text-muted)] hover:text-[var(--danger)]"
                >
                  <span className="text-xs">DEL</span>
                </button>
              </div>
            );
          })}
        </div>

        {conversations.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              [SIN REGISTROS ACTIVOS]
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-main)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
            <span className="text-xs text-[var(--text-secondary)] truncate max-w-[100px]">
              {user?.email?.split("@")[0] || "GUEST"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Configuración"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => signOut()}
              className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
              title="Desconectar"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <ConfirmModal
        isOpen={!!deleteId}
        title="ELIMINAR_REGISTRO"
        message="Esta acción es irreversible. ¿Confirmar borrado de datos?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="BORRAR"
        cancelText="CANCELAR"
      />
    </aside>
  );
}
