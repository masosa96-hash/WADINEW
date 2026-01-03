import { useState, useEffect } from "react";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { runWadiDiagnostic } from "../utils/wadiTester";
import { X } from "lucide-react";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { exportData } = useChatStore();

  const {
    theme,
    language,
    customInstructions,
    updateSettings,
    wipeAllData,
    fetchSettings,
  } = useSettingsStore();

  const [localPrompt, setLocalPrompt] = useState(customInstructions);
  const [activeTab, setActiveTab] = useState<"general" | "persona" | "data">(
    "general"
  );

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalPrompt(customInstructions);
  }, [customInstructions]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="w-full max-w-[500px] bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col h-[600px] shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-panel)]">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">
            PANEL_CONTROL
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
          {(["general", "persona", "data"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? "bg-[var(--bg-main)] text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-main)] custom-scrollbar">
          {activeTab === "general" && (
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest block">
                  Idioma de Interfaz
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateSettings({ language: "es" })}
                    className={`px-4 py-3 border text-xs uppercase transition-colors ${
                      language === "es"
                        ? "border-[var(--text-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                    }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => updateSettings({ language: "en" })}
                    className={`px-4 py-3 border text-xs uppercase transition-colors ${
                      language === "en"
                        ? "border-[var(--text-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest block">
                  Tema Visual
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSettings({ theme: t })}
                      className={`px-2 py-3 border text-xs uppercase transition-colors ${
                        theme === t
                          ? "border-[var(--text-primary)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                          : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
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
            <div className="space-y-6 h-full flex flex-col">
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest block">
                  Instrucciones del Sistema
                </label>
                <div className="text-[10px] text-[var(--text-muted)] mb-2">
                  Sobreescribe la personalidad base. Borrar para reiniciar.
                </div>
                <textarea
                  className="w-full flex-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs p-4 focus:border-[var(--text-primary)] outline-none resize-none leading-relaxed min-h-[300px]"
                  placeholder="// Escribe aquí las instrucciones de comportamiento..."
                  value={localPrompt}
                  onChange={(e) => setLocalPrompt(e.target.value)}
                  onBlur={() =>
                    updateSettings({ customInstructions: localPrompt })
                  }
                />
                <div className="text-right text-[10px] text-[var(--text-muted)] mt-1">
                  {localPrompt.length} caracteres
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-6">
              <button
                onClick={exportData}
                className="w-full py-4 border border-[var(--border-subtle)] hover:bg-[var(--bg-panel)] transition-colors flex items-center justify-between px-4 group"
              >
                <span className="text-xs text-[var(--text-primary)] uppercase tracking-wider">
                  Descargar Copia Local (JSON)
                </span>
                <span className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                  ↓
                </span>
              </button>

              <div className="pt-8 border-t border-[var(--danger)]/30 mt-8">
                <h3 className="text-[var(--danger)] text-xs font-bold uppercase tracking-widest mb-4">
                  DANGER ZONE
                </h3>
                <div className="mb-6 flex justify-between items-center bg-[var(--bg-panel)] p-3 border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] uppercase">
                    Autodiagnóstico
                  </span>
                  <button
                    onClick={runWadiDiagnostic}
                    className="text-[10px] text-[var(--text-primary)] hover:underline uppercase"
                  >
                    [ EJECUTAR ]
                  </button>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] mb-4">
                  Esta acción eliminará permanentemente todas las conversaciones
                  y memorias asociadas.
                </p>
                <button
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    const confirmed = window.confirm(
                      "CONFIRMAR BORRADO DE SISTEMA: Acción irreversible."
                    );
                    if (confirmed) wipeAllData();
                  }}
                  className="w-full py-3 border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-all font-bold text-xs tracking-widest uppercase"
                >
                  ELIMINAR TODO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
