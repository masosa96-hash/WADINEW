import { useState } from "react";
import { useChatStore, type ChatMode } from "../store/chatStore";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings, exportData, clearAllChats } =
    useChatStore();
  const [activeTab, setActiveTab] = useState<"general" | "persona" | "data">(
    "general"
  );

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
                      settings.language === "es"
                        ? "border-[var(--wadi-primary)] bg-[var(--wadi-primary)]/10 text-[var(--wadi-primary)]"
                        : "border-[var(--wadi-border)] text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"
                    }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => updateSettings({ language: "en" })}
                    className={`flex-1 px-4 py-2 border rounded text-xs font-mono-wadi transition-all ${
                      settings.language === "en"
                        ? "border-[var(--wadi-primary)] bg-[var(--wadi-primary)]/10 text-[var(--wadi-primary)]"
                        : "border-[var(--wadi-border)] text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                  Tema Visual
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["light", "dark", "system"] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      className={`px-2 py-2 border rounded text-xs font-mono-wadi transition-all uppercase ${
                        settings.theme === theme
                          ? "border-[var(--wadi-primary)] bg-[var(--wadi-primary)]/10 text-[var(--wadi-primary)]"
                          : "border-[var(--wadi-border)] text-[var(--wadi-text-muted)] hover:border-[var(--wadi-text-muted)]"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "persona" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                    Nivel de Sarcasmo
                  </label>
                  <span className="text-xs font-mono-wadi text-[var(--wadi-primary)]">
                    {settings.sarcasmLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={settings.sarcasmLevel}
                  onChange={(e) =>
                    updateSettings({ sarcasmLevel: parseInt(e.target.value) })
                  }
                  className="w-full h-1 bg-[var(--wadi-border)] rounded-lg appearance-none cursor-pointer accent-[var(--wadi-primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--wadi-text-muted)] font-mono-wadi">
                  <span>Sutil</span>
                  <span>Nuclear</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono-wadi text-[var(--wadi-text-secondary)] uppercase">
                  Modo por Defecto
                </label>
                <select
                  value={settings.defaultMode}
                  onChange={(e) =>
                    updateSettings({ defaultMode: e.target.value as ChatMode })
                  }
                  className="w-full bg-[var(--wadi-surface)] border border-[var(--wadi-border)] text-[var(--wadi-text)] text-xs p-3 rounded font-mono-wadi outline-none focus:border-[var(--wadi-primary)]"
                >
                  <option value="normal">General (Compañero)</option>
                  <option value="tech">Tech (Técnico)</option>
                  <option value="biz">Biz (Negocios)</option>
                  <option value="tutor">Tutor (Aprendizaje)</option>
                </select>
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

              <button
                onClick={() => {
                  if (
                    confirm("ESTO ES IRREVERSIBLE. ¿Borrar TODA la historia?")
                  ) {
                    clearAllChats();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-between p-4 border border-[var(--wadi-alert)]/30 rounded hover:bg-[var(--wadi-alert)]/10 transition-colors group text-[var(--wadi-alert)]"
              >
                <span className="text-xs font-mono-wadi uppercase">
                  Quemar Archivos (Borrar Todo)
                </span>
                <span className="group-hover:animate-pulse">⚠️</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
