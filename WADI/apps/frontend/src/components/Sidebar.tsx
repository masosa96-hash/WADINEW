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
  const { signOut } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { icon: Terminal, label: "Chat", path: "/" }, // Direct access to ChatRedirect
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: History, label: "History", path: "/history" },
  ];



  return (
    <aside className="w-14 h-screen bg-transparent flex flex-col shrink-0 z-50 border-r border-transparent opacity-60 hover:opacity-100 transition-opacity duration-500">
      {/* Brand - Minimal Text */}
      <div className="h-14 flex items-center justify-center">
        <div className="font-sans font-bold text-xl tracking-tighter text-wadi-text opacity-20">
          W
        </div>
      </div>

      {/* Navigation - Clean List */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-center w-10 h-10 rounded-lg transition-all mx-auto
              ${isActive 
                ? "text-wadi-text bg-black/5" 
                : "text-wadi-muted/40 hover:text-wadi-text hover:bg-black/5"}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
          </NavLink>
        ))}
      </nav>

      {/* User / Settings - Minimal Footer */}
      <div className="p-2 mt-auto">
        <div className="pt-4 flex flex-col gap-2 items-center">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg text-wadi-muted/40 hover:text-wadi-text hover:bg-black/5 transition-colors">
                <Settings size={20} strokeWidth={2} />
            </button>
            <button 
                onClick={() => signOut()}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-wadi-muted/40 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
                <LogOut size={20} strokeWidth={2} />
            </button>
        </div>
      </div>
    </aside>
  );
}
