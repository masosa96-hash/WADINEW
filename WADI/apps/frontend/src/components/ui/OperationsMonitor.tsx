import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, ChevronDown } from "lucide-react";
// We use useLogStore instead of useChatStore for logs, as implemented in v5.3.0
import { useLogStore, type LogEntry } from "../../store/logStore";

export const OperationsMonitor = () => {
  const { logs, isVisible, toggleVisibility } = useLogStore(); // Integrating with global store
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando entra un log nuevo
  useEffect(() => {
    if (scrollRef.current) {
      // Since flex-col-reverse or similar might be used, or just standard scroll.
      // If logs are [newest, ...oldest], we might want to reverse for display or scroll to top?
      // In logStore: logs: [newLog, ...state.logs]. So index 0 is newest.
      // If we map them in order, newest is top.
      // User template maps logs. usually logs are chronological in display.
      // I will adhere to the Visual design.
      scrollRef.current.scrollTop = 0; // If new logs are at top
    }
  }, [logs]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 text-xs font-mono">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-64 flex flex-col overflow-hidden rounded-xl border border-[var(--wadi-glass-border)] bg-[#0A0F1C]/90 backdrop-blur-xl shadow-2xl"
          >
            {/* Header del Monitor */}
            <div className="flex items-center justify-between bg-white/5 p-3 border-b border-white/10 select-none">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[var(--wadi-primary)]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  System Logs
                </span>
                <span className="bg-slate-800 px-1.5 rounded text-[9px] text-slate-400">
                  {logs.length}
                </span>
              </div>
              <button
                onClick={toggleVisibility}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Area de Logs */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-2 scrollbar-hide"
            >
              {logs.length === 0 && (
                <div className="text-slate-600 italic text-center mt-10">
                  Esperando actividad del núcleo...
                </div>
              )}
              {logs.map((log: LogEntry) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 items-start"
                >
                  <span className="text-slate-600 shrink-0">
                    [
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                    })}
                    ]
                  </span>
                  <span
                    className={`break-words leading-tight ${
                      log.type === "process"
                        ? "text-blue-400"
                        : log.type === "info"
                          ? "text-slate-300"
                          : log.type === "success"
                            ? "text-emerald-400"
                            : log.type === "warning"
                              ? "text-amber-400"
                              : log.type === "error"
                                ? "text-rose-500 font-bold"
                                : "text-slate-300"
                    }`}
                  >
                    {log.message}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Flotante con Indicador de Pulso */}
      {!isVisible && (
        <motion.button
          layoutId="monitor-btn"
          onClick={toggleVisibility}
          className="relative p-3 rounded-full bg-[#0A0F1C]/80 border border-[var(--wadi-primary-dim)] shadow-lg group hover:border-[var(--wadi-primary)] transition-all backdrop-blur-md"
        >
          <Activity
            size={20}
            className="text-slate-400 group-hover:text-[var(--wadi-primary)]"
          />
          {logs.length > 0 && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--wadi-primary)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--wadi-primary)]"></span>
            </span>
          )}
        </motion.button>
      )}
    </div>
  );
};
