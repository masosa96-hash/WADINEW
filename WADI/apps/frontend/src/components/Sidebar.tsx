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
  } = useChatStore();

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchCriminalSummary();
    }
  }, [user?.id]);

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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Borrar chat?")) {
      await deleteConversation(id);
      if (location.pathname.includes(id)) {
        navigate("/chat");
      }
      fetchConversations();
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside
      className={`sidebar-drawer ${
        isOpen ? "open" : ""
      } flex flex-col h-full bg-white/50 backdrop-blur-xl border-r border-[var(--monday-border)] w-[280px] shadow-2xl z-50 transition-all duration-300`}
    >
      {/* HEADER */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#38bdf8] flex items-center justify-center shadow-md text-white font-bold text-xs">
            M
          </div>
          <h1 className="font-['Outfit'] text-lg font-bold text-slate-800 tracking-tight">
            Monday
          </h1>
        </div>
        <button
          onClick={handleNewChat}
          className="p-2 bg-white hover:bg-slate-50 border border-slate-100 rounded-lg shadow-sm text-slate-500 hover:text-[#8B5CF6] transition-all"
          title="Nuevo Chat"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          Conversaciones
        </h3>
        {conversations && conversations.length > 0 ? (
          conversations.map((c) => {
            const isActive = location.pathname.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => handleHistoryClick(c.id)}
                className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-white shadow-sm border border-purple-100"
                    : "hover:bg-white/60 hover:shadow-xs"
                }`}
              >
                <MessageSquare
                  size={16}
                  className={
                    isActive
                      ? "text-[#8B5CF6]"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />
                <div className="flex-1 overflow-hidden">
                  <p
                    className={`text-sm truncate ${
                      isActive ? "font-medium text-slate-800" : "text-slate-600"
                    }`}
                  >
                    {c.title || "Nueva Conversación"}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm italic">
            Sin chats recientes.
          </div>
        )}
      </div>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-slate-100 bg-white/30 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
            <User size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-slate-700 truncate">
              {user?.email?.split("@")[0] || "Usuario"}
            </p>
            <p className="text-[10px] text-slate-400">En línea</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 text-slate-400 hover:text-[#8B5CF6] hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={() => signOut()}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </aside>
  );
}
