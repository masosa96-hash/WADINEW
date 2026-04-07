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
  ArrowRight,
  Loader2
} from "lucide-react";

/**
 * ProjectBlueprint
 * Una tarjeta elegante que muestra el resumen estructurado de la idea 
 * destilada por WADI antes de la creación final.
 */
export const ProjectBlueprint: React.FC = () => {
  const { currentProjectContext, stage, finalizeProject } = useChatStore();

  // Si no estamos en confirmación, no mostramos nada.
  if (stage !== "confirmation") return null;

  // Si estamos en confirmación pero no hay contexto aún (el stream está llegando)
  if (!currentProjectContext) {
    return (
      <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm animate-pulse">Cristalizando blueprint estratégico...</p>
      </div>
    );
  }

  const { project_name, summary, tech_stack, milestones, priority } = currentProjectContext;

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Blueprint de Cristalización</span>
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
              priority === "High" ? "bg-red-500/20 text-red-400" : 
              priority === "Medium" ? "bg-amber-500/20 text-amber-400" : 
              "bg-green-500/20 text-green-400"
            }`}>
              {priority} Priority
            </span>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter truncate">{project_name}</h2>
        </div>
      </div>

      {/* Secciones de Datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Target size={14} className="text-teal-400" /> Resumen de Visión
          </div>
          <p className="text-sm font-medium leading-relaxed line-clamp-3">{summary}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Code2 size={14} className="text-indigo-400" /> Tech Stack Sugerido
          </div>
          <div className="flex flex-wrap gap-2">
            {tech_stack.map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-white/5 pb-2">
            <Calendar size={14} className="text-amber-400" /> Roadmap Estratégico
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((m, i) => (
              <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 h-full">
                <h4 className="text-xs font-bold text-white mb-1 uppercase tracking-tight">{m.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{m.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-2 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
           <ShieldCheck size={16} className="text-indigo-400 shrink-0" />
           <p className="text-[10px] text-indigo-300">WADI ha verificado la viabilidad técnica y está listo para orquestar los microservicios necesarios.</p>
        </div>
      </div>

      {/* Acción Final */}
      <button 
        onClick={finalizeProject}
        className="group w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(79,70,229,0.3)] ring-1 ring-white/20"
      >
        <Zap size={22} className="text-yellow-300 fill-current" /> 
        CRISTALIZAR Y CONSTRUIR
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-center text-[9px] text-slate-500 mt-6 px-10 leading-relaxed uppercase tracking-[0.2em]">
        Esta acción es irreversible y consumirá créditos de la red WADI para el despliegue automático.
      </p>
    </motion.div>
  );
};
