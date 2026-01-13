import { NavLink, useLocation } from "react-router-dom";
import { 
  FolderKanban, 
  Terminal, 
  History, 
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Sidebar() {
  const { signOut, user } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: Terminal, label: "Chat", path: "/chat" }, // Chat is technically inside projects, but global link for now? Or just remove if context dependent. Re-reading spec: "Projects, Kanban, Chat, Runs / History". Chat usually requires context. Let's keep it but maybe it redirects to last project? For now, simple links.
    { icon: History, label: "History", path: "/history" }, // Placeholder for Runs
  ];

  // Helper to determine active state including sub-routes
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-64 h-screen bg-wadi-base border-r border-wadi-border flex flex-col shrink-0 z-50">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-wadi-border">
        <div className="font-mono font-bold text-xl tracking-tighter text-wadi-text animate-pulse-slow">
          WADI<span className="text-wadi-accent">.SYS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide transition-colors
              ${isActive 
                ? "bg-wadi-surface text-wadi-accent border border-wadi-border/50" 
                : "text-wadi-muted hover:text-wadi-text hover:bg-wadi-surface/50"}
            `}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / Settings */}
      <div className="p-3 border-t border-wadi-border space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide text-wadi-muted hover:text-wadi-text hover:bg-wadi-surface/50 transition-colors text-left">
           <Settings size={16} />
           <span>Settings</span>
        </button>
        
        <div className="pt-2 mt-2 border-t border-wadi-border/30">
            <div className="px-3 py-2 mb-1">
                <p className="text-[10px] text-wadi-muted/50 font-mono uppercase">User Scope</p>
                <p className="text-xs text-wadi-text font-mono truncate">{user?.email}</p>
            </div>
            <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide text-wadi-error hover:bg-wadi-error/10 transition-colors text-left"
            >
                <LogOut size={16} />
                <span>Disconnect</span>
            </button>
        </div>
      </div>
    </aside>
  );
}
