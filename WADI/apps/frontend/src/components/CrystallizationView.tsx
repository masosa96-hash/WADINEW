import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import type { WadiProjectContext } from "@wadi/db-types";
import { 
  Rocket, 
  HelpCircle, 
  CheckCircle2, 
  Code2, 
  Target, 
  Construction,
  ChevronRight
} from "lucide-react";
import { CrystallizingLoader } from "./CrystallizingLoader";



/**
 * CrystallizationView
 * El cerebro visual de la "evolución" del proyecto WADI.
 * Reacciona al 'stage' global para cambiar la arquitectura de la UI.
 */
export const CrystallizationView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stage, currentProjectContext } = useChatStore();

  // Variantes de animación para las transiciones
  const stageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Columna Principal: Siempre contiene el Chat (children) */}
      <motion.div 
        layout
        className={`flex flex-col h-full transition-all duration-500 ${
          stage === "exploration" ? "w-full" : "w-1/2"
        }`}
      >
        {children}
      </motion.div>

      {/* Columna de Soporte Dinámico (Crystallization) */}
      <AnimatePresence mode="wait">
        {stage !== "exploration" && (
          <motion.aside
            key={stage}
            variants={stageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-1/2 h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 flex flex-col overflow-y-auto"
          >
            {/* Header del Stage */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                {stage === "clarification" && <HelpCircle size={24} />}
                {stage === "confirmation" && <CheckCircle2 size={24} />}
                {stage === "project_creation" && <Rocket size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                  {stage.replace("_", " ")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stage === "clarification" && "Afinando los detalles del plan..."}
                  {stage === "confirmation" && "Validá la estructura de tu idea."}
                  {stage === "project_creation" && "Saliendo del barro hacia el código."}
                </p>
              </div>
            </div>

            {/* Renderizado dinámico según etapa */}
            <div className="flex-1">
              <CrystallizingLoader />
              {stage === "clarification" && (
                <ClarificationPhase context={currentProjectContext} />
              )}
              {stage === "confirmation" && (
                <ConfirmationPhase context={currentProjectContext} />
              )}
              {stage === "project_creation" && (
                <CreationPhase context={currentProjectContext} />
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Sub-componentes por Etapa --- */

const ClarificationPhase = ({ context }: { context: WadiProjectContext | null }) => {
  const missing = context?.missing_dims || [];
  const questions = context?.questions || [];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
          <HelpCircle size={16} /> Pendientes de Clarificar
        </h3>
        <ul className="space-y-2">
          {missing.map((dim: string, idx: number) => (
             <li key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
               <ChevronRight size={14} className="text-amber-500" /> {dim}
             </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">WADI necesita saber:</h3>
        {questions.map((q: string, idx: number) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-sm italic">
            "{q}"
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfirmationPhase = ({ context }: { context: WadiProjectContext | null }) => {
  const { finalizeProject } = useChatStore();
  const idea = context?.project_name || "Proyecto sin nombre";

  return (
    <div className="space-y-6">
      <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
        <h3 className="text-xs uppercase tracking-widest opacity-70 mb-1">Blueprint del Proyecto</h3>
        <h2 className="text-2xl font-bold">{idea}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
            <Target size={18} />
            <span className="text-sm font-bold">Objetivo / Target</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{context?.summary || "Por definir"}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-2">
            <Code2 size={18} />
            <span className="text-sm font-bold">Tech Stack Recomendado</span>
          </div>
          <div className="flex flex-wrap gap-2">
             {context?.tech_stack?.map((tech: string, i: number) => (
               <span key={i} className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs font-medium uppercase">
                 {tech}
               </span>
             ))}
             {/* Mock de tags */}
             <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">TypeScript</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={finalizeProject}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          Confirmar y Construir <Rocket size={20} />
        </button>
        <p className="text-center text-[10px] text-slate-400 mt-4 px-8 uppercase tracking-widest leading-relaxed">
          Al confirmar, WADI orquestará la cristalización y generará los assets iniciales.
        </p>
      </div>
    </div>
  );
};

const CreationPhase = ({ context }: { context: WadiProjectContext | null }) => {

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="text-indigo-600 dark:text-indigo-400"
      >
        <Construction size={48} />
      </motion.div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-bold">WADI está procesando tu visión.</h3>
        <p className="text-sm text-slate-500 max-w-xs">Instanciando repositorio y generando el Roadmap estratégico.</p>
      </div>

      {context?.milestones && context.milestones.length > 0 && (
        <div className="w-full mt-8 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-t-2 border-indigo-500 text-left">
          <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3 tracking-widest">Hito 1 Detectado</h4>
          <p className="text-sm font-medium">{context.milestones[0].title}: {context.milestones[0].description}</p>
        </div>
      )}
    </div>
  );
};
