import { useRef } from "react";
import { useLogStore } from "../../store/logStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Terminal,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export function OperationsMonitor() {
  const { logs, isVisible, toggleVisibility } = useLogStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={12} className="text-green-400" />;
      case "error":
        return <XCircle size={12} className="text-red-400" />;
      case "warning":
        return <AlertTriangle size={12} className="text-yellow-400" />;
      case "process":
        return <Loader2 size={12} className="text-blue-400 animate-spin" />;
      default:
        return <Terminal size={12} className="text-slate-400" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "process":
        return "text-blue-400";
      default:
        return "text-slate-300";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-mono text-xs">
      <button
        onClick={toggleVisibility}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl text-slate-300 hover:text-white hover:border-slate-500 transition-all group"
      >
        <Activity
          size={14}
          className={logs.length > 0 ? "text-green-400 animate-pulse" : ""}
        />
        <span className="font-bold tracking-wider">SYSTEM_LOGS</span>
        <span className="bg-slate-800 px-1.5 rounded text-[10px] min-w-[20px] text-center">
          {logs.length}
        </span>
        {isVisible ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-64 bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-2 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <span className="text-[10px] uppercase text-slate-500 font-bold">
                Monitor de Operaciones
              </span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              ref={scrollRef}
            >
              {logs.length === 0 && (
                <div className="text-slate-600 text-center mt-10 italic">
                  Esperando eventos...
                </div>
              )}
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2 items-start bg-slate-900/30 p-1.5 rounded"
                >
                  <span className="mt-0.5 opacity-70 shrink-0">
                    {getIcon(log.type)}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`${getColor(log.type)} leading-tight break-words`}
                    >
                      {log.message}
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
