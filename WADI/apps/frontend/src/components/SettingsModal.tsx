import { useState, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useConfigStore } from "../store/configStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { runWadiDiagnostic } from "../utils/wadiTester";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { exportData } = useChatStore();

  // Legacy Store (Still handling Data Wipe)
  const { wipeAllData } = useConfigStore();

  // New Modular Store (Handling UI & Persona)
  const { theme, language, customInstructions, updateSettings } =
    useSettingsStore();

  const [localPrompt, setLocalPrompt] = useState(customInstructions);
  const [activeTab, setActiveTab] = useState<"general" | "persona" | "data">(
    "general"
  );

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Sync local state when store updates (e.g. after fetch)
  useEffect(() => {
    setLocalPrompt(customInstructions);
  }, [customInstructions]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[90%] max-w-[500px] bg-[var(--wadi-bg)] border border-[var(--wadi-primary)] shadow-[0_0_30px_rgba(var(--wadi-primary-rgb),0.2)] rounded-lg overflow-hidden flex flex-col h-[500px]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--wadi-border)] flex justify-between items-center bg-[var(--wadi-surface)]/50">
          <h2 className="font-mono-wadi text-sm font-bold text-[var(--wadi-primary)] uppercase tracking-wider">
            [CONFIGURACIÓN_DEL_SISTEMA]
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--wadi-text-secondary)] hover:text-[var(--wadi-text)] transition-colors text-xs"
          >
            [X]
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--wadi-border)] bg-[var(--wadi-bg)]">
          {(["general", "persona", "data"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-mono-wadi uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "bg-[var(--wadi-primary)] text-black font-bold"
                  : "text-[var(--wadi-text-muted)] hover:text-[var(--wadi-text)] hover:bg-[var(--wadi-surface)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                  Idioma de Interfaz
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateSettings({ language: "es" })}
                    className={`flex-1 px-4 py-2 border rounded text-xs font-mono-wadi transition-all ${
                      language === "es"
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "border-[var(--wadi-border)] bg-zinc-900 text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"
                    }`}
                  >
                    ESPAÑOL
                  </button>
                  <button
                    onClick={() => updateSettings({ language: "en" })}
                    className={`flex-1 px-4 py-2 border rounded text-xs font-mono-wadi transition-all ${
                      language === "en"
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "border-[var(--wadi-border)] bg-zinc-900 text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"
                    }`}
                  >
                    ENGLISH
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                  Tema Visual
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`px-2 py-2 border rounded text-xs font-mono-wadi transition-all uppercase ${
                        theme === t
                          ? "border-purple-500 bg-purple-600/10 text-purple-300"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "persona" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                  Instrucciones del Sistema (WADI Brain)
                </label>
                <div className="text-[10px] text-[var(--wadi-text-muted)] leading-relaxed mb-2">
                  Define la personalidad y reglas de WADI. Si lo dejas vacío,
                  usará el modo "Payaso Triste" por defecto.
                </div>
                <textarea
                  className="w-full h-64 bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] text-xs p-3 rounded font-mono custom-scrollbar focus:border-[var(--wadi-primary)] outline-none resize-none placeholder:opacity-30 leading-relaxed"
                  placeholder="Ej: Eres un asistente experto en cocina molecular..."
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  onBlur={() =>
                    updateSettings({ customInstructions: localPrompt })
                  }
                />
                <div className="flex justify-between items-center text-[10px] text-[var(--wadi-text-muted)] font-mono">
                  <span>Se guarda automáticamente</span>
                  <span className="text-[var(--wadi-primary)] opacity-50">
                    {localPrompt.length} chars
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-4">
              <button
                onClick={exportData}
                className="w-full flex items-center justify-between p-4 border border-[var(--wadi-border)] rounded hover:bg-[var(--wadi-surface)] transition-colors group"
              >
                <span className="text-xs font-mono-wadi text-[var(--wadi-text)] uppercase">
                  Exportar mis datos (JSON)
                </span>
                <span className="text-[var(--wadi-text-muted)] group-hover:text-[var(--wadi-primary)]">
                  ↓
                </span>
              </button>

              <div className="p-4 bg-zinc-950 border border-red-900/30 rounded mt-4">
                <h3 className="text-red-700 font-mono text-xs mb-2 font-bold uppercase tracking-widest">
                  [ ZONA DE PELIGRO ]
                </h3>
                <p className="text-zinc-500 text-[10px] mb-4 leading-relaxed">
                  Esto eliminará todo el historial de WADI. No hay vuelta atrás.
                </p>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={runWadiDiagnostic}
                    className="text-[10px] font-mono text-zinc-500 hover:text-green-500 transition-colors uppercase tracking-wider"
                  >
                    [ EJECUTAR AUTO-TEST DE SISTEMA ]
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm("¿Seguro? WADI no olvidará este desprecio."))
                      wipeAllData();
                  }}
                  className="w-full py-2 border border-red-900 bg-red-950/20 text-red-700 hover:bg-red-900 hover:text-white transition-all font-bold text-[10px] tracking-widest uppercase rounded"
                >
                  ELIMINAR TODA LA DATA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
