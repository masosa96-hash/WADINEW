
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

import { useChatStore } from '../store/chatStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { Trash2, CheckSquare, Square } from 'lucide-react';

const menuItems = [
  { icon: MessageSquare, label: 'Chat Principal', path: '/' },
  { icon: LayoutGrid, label: 'Mis Proyectos', path: '/projects' },
  { icon: Database, label: 'Knowledge Base', path: '/knowledge' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const { 
    conversations, 
    fetchConversations, 
    openConversation, 
    activeId, 
    startNewConversation,
    selectedIds,
    toggleSelection,
    deleteSelectedConversations
  } = useChatStore();

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleOpenChat = (id: string) => {
     openConversation(id);
     navigate('/');
  };

  const handleNewChat = () => {
     startNewConversation();
     navigate('/');
  };

  return (
    <aside className="w-64 h-screen bg-[#F9FAFB] border-r border-gray-100 flex flex-col transition-all duration-300">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* Logo / Branding */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg italic">W</span>
        </div>
        <span className="font-bold text-gray-800 tracking-tight text-xl">WADI</span>
      </div>

      {/* Botón de Acción Principal */}
      <div className="px-4 mb-6">
        <button 
            onClick={handleNewChat}
            className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <PlusCircle size={16} />
          Nuevo Chat
        </button>
      </div>

      {/* Navegación Principal */}
      <nav className="px-3 space-y-1 mb-4">
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

      {/* Historial de Conversaciones */}
      <div className="px-4 py-2 mt-2 flex-1 overflow-hidden flex flex-col min-h-0 border-t border-gray-100">
         <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Historial</h3>
            <button 
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${isSelectionMode ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
              title="Gestión Masiva"
            >
               <CheckSquare size={14} />
            </button>
         </div>
         
         {isSelectionMode && selectedIds.length > 0 && (
             <button 
                onClick={() => deleteSelectedConversations()}
                className="w-full mb-3 flex items-center justify-center gap-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
             >
                <Trash2 size={12} />
                Eliminar ({selectedIds.length})
             </button>
         )}

         <div className="overflow-y-auto flex-1 space-y-1 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
            {conversations.map((conv) => (
               <div 
                 key={conv.id}
                 className={`
                    group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                    ${activeId === conv.id ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}
                 `}
                 onClick={() => {
                    if (isSelectionMode) {
                        toggleSelection(conv.id);
                    } else {
                        handleOpenChat(conv.id);
                    }
                 }}
               >
                  {isSelectionMode ? (
                      <div className={`shrink-0 ${selectedIds.includes(conv.id) ? 'text-blue-600' : 'text-gray-300'}`}>
                          {selectedIds.includes(conv.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                  ) : (
                      <MessageSquare size={14} className={`shrink-0 ${activeId === conv.id ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  )}
                  
                  <span className="truncate flex-1">
                      {conv.title || "Nueva Conversación"}
                  </span>
               </div>
            ))}
            
            {conversations.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                    Sin historial reciente.
                </div>
            )}
         </div>
      </div>

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

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
        >
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
