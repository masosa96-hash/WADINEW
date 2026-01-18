import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { X, Shield, Fingerprint } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { customInstructions } = useSettingsStore();
  const { session } = useAuthStore();
  // Defaulting to "BASED_REDDIT" as per "Chau Modos" rule
  // Defaulting to "BASED_REDDIT" as per "Chau Modos" rule
  
  // Load initial state mock (would process from customInstructions or fetch if we had store field)
  // For now just defaulting.

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Preferencias de WADI</h2>
              <p className="text-xs text-gray-500">Ajustá la matriz de personalidad.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* User ID Only - Clean UI */}
          <div className="flex gap-4">
             <div className="flex-1 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <Fingerprint size={14} />
                    <span>Supabase ID</span>
                </div>
                <code className="block w-full text-xs font-mono text-gray-600 break-all select-all">
                    {session?.user?.id || "No conectado"}
                </code>
             </div>

             <div className="flex-1 p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <Shield size={14} />
                    <span>Persona Activa</span>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                    Based Reddit (Enforced)
                </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          {/* Custom Instructions */}
          <div className="space-y-4">
               <div>
                   <label className="text-sm font-semibold text-gray-800">Instrucciones Custom (System Prompt)</label>
                   <p className="text-xs text-gray-500 mt-1">
                       Estas instrucciones se inyectan en el cerebro de WADI. Usalas para definir temas prohibidos, estilo de código preferido, etc.
                   </p>
               </div>
               <textarea
                   value={customInstructions || ""}
                   onChange={(e) => useSettingsStore.getState().setCustomInstructions(e.target.value)}
                   placeholder="Ej: Prefiero TypeScript estricto. No uses emojis. Se breve."
                   className="w-full h-32 p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none shadow-sm"
               />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button 
                onClick={async () => {
                   try {
                       const { session } = useAuthStore.getState();
                       if (!session?.access_token) return;

                       // API Call
                       const API_URL = import.meta.env.VITE_API_URL || "https://wadi-wxg7.onrender.com";
                       const response = await fetch(`${API_URL.replace(/\/$/, "")}/api/user/preferences`, {
                           method: 'PATCH',
                           headers: {
                               'Content-Type': 'application/json',
                               'Authorization': `Bearer ${session.access_token}`
                           },
                           body: JSON.stringify({
                               naturalness_level: 50, // Default sane value
                               active_persona: "BASED_REDDIT", // Enforced
                               custom_instructions: customInstructions,
                           })
                       });

                       if (response.ok) {
                           await response.json();
                           useSettingsStore.getState().setCustomInstructions(customInstructions || "");
                           onClose();
                       } else {
                           console.error("Failed to save settings");
                           // eslint-disable-next-line no-alert
                           alert("Error guardando cambios. Verificá la consola y tu conexión a Supabase.");
                       }
                   } catch (e) {
                       console.error(e);
                       // eslint-disable-next-line no-alert
                       alert("Error de red al guardar configuración.");
                   }
                }}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
            >
                Confirmar Cambios
            </button>
        </div>

      </div>
    </div>
  );
};
