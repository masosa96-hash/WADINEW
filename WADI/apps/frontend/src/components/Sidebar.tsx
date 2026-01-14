import { NavLink } from "react-router-dom";
import { 
  FolderKanban, 
  Terminal, 
  History, 
  Settings, 
  LogOut,
  Brain
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Sidebar() {
  const { signOut } = useAuthStore();

  const navItems = [
    { icon: Terminal, label: "Chat", path: "/" }, // Chat Redirect
    { icon: FolderKanban, label: "Proyectos", path: "/projects" },
    { icon: Brain, label: "Memoria", path: "/knowledge" },
  ];

  return (
    <aside className="w-16 h-screen bg-wadi-surface border-r border-wadi-border flex flex-col shrink-0 z-50">
      {/* Brand */}
      <div className="h-16 flex items-center justify-center border-b border-wadi-border/50">
        <div className="w-8 h-8 bg-wadi-text rounded-lg flex items-center justify-center text-wadi-base font-bold text-lg">
          W
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) => `
              flex items-center justify-center w-10 h-10 rounded-xl transition-all mx-auto
              ${isActive 
                ? "text-wadi-base bg-wadi-text shadow-sm" 
                : "text-wadi-muted hover:text-wadi-text hover:bg-black/5"}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 mt-auto border-t border-wadi-border/50 flex flex-col gap-2 items-center py-4">
        <button 
            title="Configuración"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-wadi-muted hover:text-wadi-text hover:bg-black/5 transition-colors">
            <Settings size={20} strokeWidth={2} />
        </button>
        <button 
            onClick={() => signOut()}
            title="Cerrar Sesión"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-wadi-muted hover:text-wadi-error hover:bg-red-50 transition-colors"
        >
            <LogOut size={20} strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
