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

  // Helper to determine active state including sub-routes
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-56 h-screen bg-neutral-50/50 flex flex-col shrink-0 z-50">
      {/* Brand - Minimal Text */}
      <div className="h-14 flex items-center px-4">
        <div className="font-sans font-medium text-lg tracking-tight text-wadi-text">
          wadi
        </div>
      </div>

      {/* Navigation - Clean List */}
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-all
              ${isActive 
                ? "bg-white shadow-sm text-wadi-text font-medium" 
                : "text-wadi-muted hover:text-wadi-text hover:bg-black/5"}
            `}
          >
            <item.icon size={15} strokeWidth={2} className={isActive(item.path) ? "text-wadi-accent" : "opacity-70"} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / Settings - Minimal Footer */}
      <div className="p-2 mt-auto">
        <div className="pt-2 border-t border-black/5">
            <button className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-wadi-muted hover:text-wadi-text hover:bg-black/5 transition-colors">
                <Settings size={15} strokeWidth={2} />
                <span>Settings</span>
            </button>
            <button 
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm text-wadi-muted hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
            >
                <LogOut size={15} strokeWidth={2} />
                <span>Disconnect</span>
            </button>
        </div>
      </div>
    </aside>
  );
}
