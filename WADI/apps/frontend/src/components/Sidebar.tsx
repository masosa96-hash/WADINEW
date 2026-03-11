import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  LayoutGrid, 
  Database, 
  Settings, 
  User, 
  Plus, 
  LogOut,
  Trash2,
  CheckSquare,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/useAuthStore';
import { SettingsModal } from './SettingsModal';
import { GUEST_PROJECT_ID } from '../views/Chat';

const menuItems = [
  { icon: MessageSquare, label: 'Chat Principal', path: '/chat' },
  { icon: LayoutGrid, label: 'Mis Proyectos', path: '/projects' },
  { icon: Database, label: 'Knowledge Base', path: '/knowledge' },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { session, user, signOut } = useAuthStore();
  const isGuest = projectId === GUEST_PROJECT_ID || !session;

  const scopes = (user?.user_metadata?.scopes as string[]) || [];
  const isAdmin = scopes.includes("admin:*");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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
    if (isGuest) return;
    fetchConversations();
  }, [isGuest, fetchConversations]);

  const handleOpenChat = (id: string) => {
     openConversation(id);
     navigate('/chat');
  };

  const handleNewChat = () => {
     startNewConversation();
     navigate('/chat');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-[#F8F9FA] border-r border-wadi-gray-100 flex flex-col p-4 font-wadi-sans transition-all duration-300 relative">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* 1. Header & Logo */}
      <div className="flex items-center gap-2 px-2 mb-8 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-wadi-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
          W
        </div>
        <span className="font-bold text-xl tracking-tight text-wadi-gray-900">WADI</span>
      </div>

      {/* 2. Botón Acción Principal */}
      <button 
        onClick={handleNewChat}
        className="flex items-center justify-center gap-2 w-full py-3 mb-8 bg-white border border-wadi-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-sm font-semibold text-wadi-gray-700"
      >
        <Plus size={16} />
        Nuevo Chat
      </button>

      {/* 3. Navegación Principal */}
      <nav className="space-y-1 mb-6">
        <p className="px-3 text-[10px] font-bold text-wadi-gray-400 uppercase tracking-widest mb-2">Workspace</p>
        
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className="block">
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-wadi-gray-900 text-white shadow-sm' 
                    : 'text-wadi-gray-500 hover:bg-wadi-gray-100 hover:text-wadi-gray-900'
                }`}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink to="/admin" className="block mt-2">
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                    : 'text-wadi-gray-500 hover:bg-wadi-gray-100 hover:text-wadi-gray-900'
                }`}
              >
                <BarChart3 size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-medium">Panel Admin</span>
              </motion.div>
            )}
          </NavLink>
        )}
      </nav>

      {/* Historial de Conversaciones */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
         {!isGuest && (
             <div className="flex items-center justify-between mb-2 px-3">
                <p className="text-[10px] font-bold text-wadi-gray-400 uppercase tracking-widest">Historial</p>
                <button 
                  onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      if (isSelectionMode) useChatStore.getState().selectAll();
                  }}
                  className="px-2 py-0.5 text-[10px] font-medium text-wadi-gray-500 hover:text-wadi-gray-900 transition-colors"
                >
                   {isSelectionMode ? "Listo" : "Gestionar"}
                </button>
             </div>
         )}

         {isGuest ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
             <p className="text-xs text-wadi-gray-400 mb-3">Sesión efímera</p>
             <button
               onClick={() => navigate('/login')}
               className="w-full py-2.5 px-3 bg-wadi-gray-900 text-white text-xs font-medium rounded-xl hover:bg-wadi-black transition-colors"
             >
               Iniciar sesión
             </button>
             <button
               onClick={() => navigate('/register')}
               className="w-full mt-2 py-2.5 px-3 bg-white border border-wadi-gray-200 text-xs font-medium text-wadi-gray-600 rounded-xl hover:bg-wadi-gray-50 transition-colors"
             >
               Crear cuenta
             </button>
           </div>
         ) : (
           <>
             {showDeleteConfirm && (
                 <div className="absolute inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-xl shadow-lg border border-red-100">
                     <div className="bg-red-50 p-3 rounded-full mb-2 text-red-500">
                         <Trash2 size={24} />
                     </div>
                     <h4 className="text-sm font-bold text-wadi-gray-900 mb-1">¿Estás seguro?</h4>
                     <p className="text-xs text-wadi-gray-500 mb-4 px-2">
                        Vas a eliminar {selectedIds.length} chats. El caos se irá para siempre.
                     </p>
                     <div className="flex gap-2 w-full">
                         <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2 px-3 bg-wadi-gray-100 text-wadi-gray-600 text-xs font-bold rounded-lg hover:bg-wadi-gray-200"
                         >
                            Cancelar
                         </button>
                         <button 
                            onClick={() => {
                                deleteSelectedConversations();
                                setShowDeleteConfirm(false);
                                setIsSelectionMode(false);
                            }}
                            className="flex-1 py-2 px-3 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                         >
                            Borrar Todo
                         </button>
                     </div>
                 </div>
             )}
             
             {isSelectionMode && selectedIds.length > 0 && (
                 <div className="absolute bottom-2 left-2 right-2 z-20">
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-red-700 transition-transform active:scale-95"
                    >
                        <Trash2 size={16} />
                        Eliminar {selectedIds.length}
                    </button>
                 </div>
             )}

             <div className="overflow-y-auto flex-1 space-y-1 pr-1 scrollbar-thin scrollbar-thumb-wadi-gray-200 pb-16">
                {conversations.map((conv) => {
                   const isActive = activeId === conv.id;
                   return (
                     <motion.div
                       key={conv.id}
                       whileHover={{ x: 4 }}
                       className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                         isActive 
                           ? 'bg-wadi-gray-200 text-wadi-gray-900 font-medium' 
                           : 'text-wadi-gray-500 hover:bg-wadi-gray-100 hover:text-wadi-gray-900'
                       }`}
                       onClick={() => {
                          if (isSelectionMode) {
                              toggleSelection(conv.id);
                          } else {
                              handleOpenChat(conv.id);
                          }
                       }}
                     >
                       {isSelectionMode ? (
                           <div className={`shrink-0 transition-colors ${selectedIds.includes(conv.id) ? 'text-blue-600' : 'text-wadi-gray-300'}`}>
                                <div className={`w-4 h-4 rounded border ${selectedIds.includes(conv.id) ? 'bg-blue-600 border-blue-600' : 'border-wadi-gray-300'} flex items-center justify-center`}>
                                     {selectedIds.includes(conv.id) && <CheckSquare size={12} className="text-white" />}
                                </div>
                           </div>
                       ) : (
                           <MessageSquare size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                       )}
                       
                       <span className="truncate text-sm flex-1">
                           {conv.title || "Nueva Conversación"}
                       </span>
                     </motion.div>
                   );
                })}
                
                {conversations.length === 0 && (
                    <div className="text-center py-6 text-xs text-wadi-gray-400 italic">
                        Sin historial reciente.
                    </div>
                )}
             </div>
           </>
         )}
      </div>

      {/* 4. Sección de Usuario / Footer */}
      <div className="mt-auto pt-6 border-t border-wadi-gray-100 space-y-1">
        <div className="px-3 mb-4">
            <div className="bg-gradient-to-br from-wadi-accent-start/10 to-wadi-accent-end/10 p-3 rounded-2xl border border-wadi-accent-start/20">
                <p className="text-[10px] font-bold text-wadi-accent-start uppercase tracking-tighter">Plan Pro</p>
                <p className="text-[11px] text-wadi-gray-600 leading-tight mt-1">Acceso total a Personas y Memoria Infinita.</p>
            </div>
        </div>
        
        <motion.div
          whileHover={{ x: 4 }}
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-wadi-gray-500 hover:bg-wadi-gray-100 hover:text-wadi-gray-900"
        >
          <Settings size={18} strokeWidth={2} />
          <span className="text-sm font-medium">Configuración</span>
        </motion.div>
        
        <div className="flex items-center gap-3 px-3 py-4 mt-2 border-t border-wadi-gray-50">
            <div className="w-8 h-8 rounded-full bg-wadi-gray-200 flex items-center justify-center shrink-0">
                <User size={16} className="text-wadi-gray-500" />
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-wadi-gray-900 truncate">
                  {user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Usuario"}
                </p>
                <p className="text-[10px] text-wadi-gray-500 truncate">
                  {isAdmin ? "Admin" : "Socio de Negocios"}
                </p>
            </div>
            <button title="Cerrar sesión" onClick={handleLogout} className="shrink-0 p-1 rounded-md hover:bg-red-50 group transition-colors">
              <LogOut size={16} className="text-wadi-gray-400 group-hover:text-red-500 transition-colors" />
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
