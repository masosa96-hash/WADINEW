import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { useEffect, useState } from "react";
import { MessageSquare, Plus, LogOut, Settings, User } from "lucide-react";
import { SettingsModal } from "./SettingsModal";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string; // Kept for compat
}

import { ConfirmModal } from "./ui/ConfirmModal";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string; // Kept for compat
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
    selectedIds,
    toggleSelection,
    selectAll,
    deleteSelectedConversations,
  } = useChatStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside
      className={`sidebar-drawer ${
        isOpen ? "open" : ""
      } flex flex-col h-full bg-[var(--wadi-bg-subtle)]/80 backdrop-blur-xl border-r border-[var(--wadi-glass-border)] w-[280px] shadow-2xl z-50 transition-all duration-300`}
    >
      {/* HEADER */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(139,92,246,0.6)] text-white font-bold text-sm tracking-widest ring-1 ring-white/20">
            W
          </div>
          <h1 className="font-['Outfit'] text-xl font-bold text-[var(--wadi-text)] tracking-tight drop-shadow-sm">
            WADI
          </h1>
        </div>
        <button
          onClick={handleNewChat}
          className="p-2 bg-[var(--wadi-surface)] hover:bg-[var(--wadi-surface-active)] border border-[var(--wadi-border)] rounded-lg shadow-sm text-[var(--wadi-text-secondary)] hover:text-[var(--wadi-primary)] transition-all hover:scale-105 active:scale-95"
          title="Nuevo Chat"
          aria-label="Nuevo Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2 scroll-smooth">
        <div className="flex justify-between items-center px-2 mb-3">
          <h2 className="text-[10px] font-bold text-[var(--wadi-text-tertiary)] uppercase tracking-widest opacity-80">
            Historial
          </h2>
          {conversations.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase"
              >
                [Todo]
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={deleteSelectedConversations}
                  className="text-[10px] font-mono text-orange-900 hover:text-orange-700 transition-colors uppercase animate-pulse"
                >
                  [Borrar {selectedIds.length}]
                </button>
              )}
            </div>
          )}
        </div>
        {conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const isActive = location.pathname.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => handleHistoryClick(c.id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-[linear-gradient(90deg,rgba(139,92,246,0.1),transparent)] border border-[var(--wadi-primary-dim)] shadow-[inset_2px_0_0_0_var(--wadi-primary)]"
                    : "hover:bg-[var(--wadi-surface-active)] border border-transparent hover:border-[var(--wadi-border)]"
                }`}
              >
                {/* Selection Checkbox */}
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => toggleSelection(c.id)}
                    className="w-3 h-3 rounded bg-zinc-800 border-zinc-700 accent-orange-900 cursor-pointer"
                  />
                </div>
                <MessageSquare
                  size={16}
                  className={
                    isActive
                      ? "text-[var(--wadi-primary)] drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                      : "text-[var(--wadi-text-tertiary)] group-hover:text-[var(--wadi-text-secondary)] transition-colors"
                  }
                />
                <div className="flex-1 overflow-hidden z-10">
                  <p
                    className={`text-sm truncate ${
                      isActive
                        ? "font-medium text-[var(--wadi-text)]"
                        : "text-[var(--wadi-text-secondary)] group-hover:text-[var(--wadi-text)] transition-colors"
                    }`}
                  >
                    {c.title || "Sin título"}
                  </p>
                </div>
                <button
                  onClick={(e) => onRequestDelete(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--wadi-text-tertiary)] hover:text-[var(--wadi-danger)] transition-all hover:bg-[var(--wadi-surface-active)] rounded z-10"
                  aria-label="Borrar chat"
                >
                  ×
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-[var(--wadi-text-tertiary)] text-xs italic flex flex-col items-center gap-2 opacity-60">
            <span>Sin memorias recientes.</span>
          </div>
        )}
      </div>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-[var(--wadi-glass-border)] bg-[var(--wadi-bg-subtle)]/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--wadi-surface-active)] transition-colors group border border-transparent hover:border-[var(--wadi-border)]">
          <div className="w-9 h-9 rounded-full bg-[var(--wadi-surface)] flex items-center justify-center text-[var(--wadi-text-secondary)] border border-[var(--wadi-border)] group-hover:border-[var(--wadi-primary-dim)] transition-colors">
            <User size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-[var(--wadi-text)] truncate group-hover:text-white transition-colors">
              {user?.email?.split("@")[0] || "Usuario"}
            </p>
            <p className="text-[10px] text-[var(--wadi-text-tertiary)] group-hover:text-[var(--wadi-accent)] transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Conectado
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 text-[var(--wadi-text-tertiary)] hover:text-[var(--wadi-primary)] hover:bg-[var(--wadi-primary-dim)] rounded-lg transition-colors"
              aria-label="Configuración"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-[var(--wadi-text-tertiary)] hover:text-[var(--wadi-danger)] hover:bg-red-900/10 rounded-lg transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <ConfirmModal
        isOpen={!!deleteId}
        title="¿Eliminar conversación?"
        message="¿Estás seguro de que deseas eliminar esta conversación? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </aside>
  );
}
