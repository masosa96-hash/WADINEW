
import { NavLink } from 'react-router-dom';
import { 
  MessageSquare, 
  LayoutGrid, 
  Database, 
  Settings, 
  PlusCircle, 
  Zap,
  UserCircle
} from 'lucide-react';

const menuItems = [
  { icon: MessageSquare, label: 'Chat Principal', path: '/' }, // Changed from /chat to / (ChatRedirect/Chat)
  { icon: LayoutGrid, label: 'Mis Proyectos', path: '/projects' },
  { icon: Database, label: 'Knowledge Base', path: '/knowledge' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-[#F9FAFB] border-r border-gray-100 flex flex-col transition-all duration-300">
      {/* Logo / Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg italic">W</span>
        </div>
        <span className="font-bold text-gray-800 tracking-tight text-xl">WADI</span>
      </div>

      {/* Botón de Acción Principal */}
      <div className="px-4 mb-6">
        <button className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm">
          <PlusCircle size={16} />
          Nuevo Chat
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive 
                ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} className={isActive ? 'text-blue-500' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sección Inferior / Status */}
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="px-3 py-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Plan Pro</span>
          </div>
          <p className="text-[10px] text-blue-600/70 leading-tight">
            Acceso total a Personas Dinámicas y Memoria Infinita.
          </p>
        </div>

        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
          <Settings size={18} />
          Configuración
        </button>

        <div className="flex items-center gap-3 px-3 py-2 border-t border-gray-50 pt-4">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <UserCircle size={20} />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold text-gray-800 truncate">Usuario WADI</span>
            <span className="text-[10px] text-gray-400 truncate">Socio de Negocios</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
