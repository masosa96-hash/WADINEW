import React from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import type { WadiStage } from "@wadi/db-types";

/**
 * StageTracker
 * Barra de progreso superior que indica el estado de cristalización de la idea.
 */
export const StageTracker: React.FC = () => {
  const { stage } = useChatStore();

  const stages: { key: WadiStage; label: string }[] = [
    { key: "exploration", label: "Idea" },
    { key: "clarification", label: "Detalles" },
    { key: "confirmation", label: "Revisión" },
    { key: "project_creation", label: "Creación" },
  ];

  const currentIdx = stages.findIndex((s) => s.key === stage);

  const getStatusColor = (idx: number) => {
    if (idx < currentIdx) return "bg-green-500"; // Completado
    if (idx === currentIdx) {
      if (stage === "exploration") return "bg-blue-500";
      if (stage === "clarification") return "bg-yellow-500";
      return "bg-indigo-500"; // Confirmation / Creation
    }
    return "bg-slate-200 dark:bg-slate-800"; // Pendiente
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-14 flex items-center px-6">
      <div className="max-w-screen-xl mx-auto w-full flex items-center justify-between gap-4">
        {stages.map((s, idx) => (
          <div key={s.key} className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                idx <= currentIdx ? "text-slate-900 dark:text-white" : "text-slate-400"
              }`}>
                {s.label}
              </span>
            </div>
            
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: idx <= currentIdx ? "100%" : "0%" }}
                 className={`h-full ${getStatusColor(idx)} transition-colors duration-500`}
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
