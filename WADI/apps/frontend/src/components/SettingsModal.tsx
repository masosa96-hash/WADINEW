import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { X, Shield, Activity, Fingerprint } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { customInstructions } = useSettingsStore();
  const { session } = useAuthStore();
  const [naturalnessLevel, setNaturalnessLevel] = React.useState<number>(50);
  const [activePersona, setActivePersona] = React.useState<string>("NORMAL");

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
        <div className="p-6 space-y-8">
          
          {/* Persona Selection */}
           <div className="space-y-2">
             <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Modo Base</label>
             <select 
                value={activePersona} 
                onChange={(e) => setActivePersona(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
             >
                 <option value="NORMAL">Normal</option>
                 <option value="BASED_REDDIT">Based Reddit (Entre Ríos)</option>
                 <option value="EXECUTIVE">Ejecutivo (Sin tonterías)</option>
                 <option value="CTO">CTO Técnico</option>
             </select>
           </div>

          {/* Naturalness Filter */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <Activity size={18} className="text-orange-500" />
                    <span>Filtro de Naturalidad</span>
                </div>
                <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    {naturalnessLevel > 75 ? 'EXTREMO' : naturalnessLevel > 40 ? 'ALTO' : 'MODERADO'}
                </span>
             </div>
             
             <input 
                type="range" 
                min="0" 
                max="100" 
                value={naturalnessLevel} 
                onChange={(e) => setNaturalnessLevel(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
             <p className="text-xs text-gray-400">
                Determina qué tan agresivamente WADI detecta y corrige respuestas genéricas. 
                <br/>
                Mayor nivel = Más informalidad.
             </p>
          </div>

          {/* User ID */}
          <div className="p-4 bg-gray-100 rounded-xl space-y-2 border border-gray-200">
             <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <Fingerprint size={14} />
                <span>Supabase ID (Identidad Neural)</span>
             </div>
             <code className="block w-full text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border border-gray-200 select-all">
                {session?.user?.id || "No conectado"}
             </code>
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
                               naturalness_level: naturalnessLevel,
                               active_persona: activePersona,
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
