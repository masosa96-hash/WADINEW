import React from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { 
  Rocket, 
  Target, 
  Code2, 
  Calendar, 
  ShieldCheck, 
  Zap,
  ArrowRight
} from "lucide-react";

/**
 * ProjectBlueprint
 * Una tarjeta elegante que muestra el resumen estructurado de la idea 
 * destilada por WADI antes de la creación final.
 */
export const ProjectBlueprint: React.FC = () => {
  const { currentProjectContext, stage, finalizeProject } = useChatStore();

  if (stage !== "confirmation" || !currentProjectContext) return null;

  const intent = (currentProjectContext.intent as any) || {};
  const ideaName = intent.idea || "Nuevo Proyecto WADI";
  const target = intent.target || "Por definir en la fase inicial";
  const domain = intent.domain || "Desconocido";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] shadow-2xl text-white overflow-hidden relative"
    >
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 blur-[100px] -z-10 rounded-full" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
          <Rocket size={24} />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Blueprint de Cristalización</span>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">{ideaName}</h2>
        </div>
      </div>

      {/* Secciones de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Target size={14} className="text-teal-400" /> Objetivo Central
          </div>
          <p className="text-sm font-medium leading-relaxed">{target}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Code2 size={14} className="text-indigo-400" /> Stack & Dominio
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">{domain}</span>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">Node.js</span>
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-teal-300">FastAPI</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Calendar size={14} className="text-amber-400" /> Timeline Estimada
          </div>
          <p className="text-sm font-medium">Fase 1: MVP en 2 semanas</p>
        </div>

        <div className="space-y-2">
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-green-400" /> Seguridad WADI
          </div>
          <p className="text-xs text-slate-500">Persistencia atómica y despliegue in-situ habilitado.</p>
        </div>
      </div>

      {/* Acción Final */}
      <button 
        onClick={finalizeProject}
        className="group w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(79,70,229,0.3)] ring-1 ring-white/20"
      >
        <Zap size={22} className="text-yellow-300 fill-current" /> 
        CONFIRMAR Y CONSTRUIR PROYECTO
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-[9px] text-slate-500 mt-6 px-10 leading-relaxed uppercase tracking-[0.2em]">
        Al proceder, WADI iniciará el pipeline de orquestación final y generará los assets del repositorio automáticamente.
      </p>
    </motion.div>
  );
};
