import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useChatStore } from "../store/chatStore";
import { Menu, Plus } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar, resetChat } =
    useChatStore();
  const navigate = useNavigate();

  const handleNewChat = () => {
    resetChat();
    navigate("/chat");
    setSidebarOpen(false);
  };

  return (
    <div className="flex w-full h-screen min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f0f4ff] via-[#f9faff] to-[#ffffff] text-[var(--monday-text)]">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Visible on Desktop, Drawer on Mobile */}
      <div
        className={`fixed lg:relative z-50 h-full transition-transform duration-300 lg:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col relative w-full overflow-hidden bg-white/40 backdrop-blur-3xl">
        {/* Mobile Top Bar */}
        <div className="lg:hidden h-[60px] border-b border-purple-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-30 shadow-sm relative">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="text-slate-500 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="flex items-center gap-2 no-underline">
              <span className="font-bold text-lg text-slate-800 tracking-tight">
                Monday
              </span>
            </Link>
          </div>

          <button
            onClick={handleNewChat}
            className="p-2 bg-[var(--monday-primary)] text-white rounded-full shadow-md active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
