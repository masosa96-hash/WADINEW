import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  PartyPopper,
  Sparkles
} from "lucide-react";
import { useLogStore } from "../store/logStore";

/**
 * SuccessProjectView
 * Celebra la cristalización exitosa del proyecto con estética High-End.
 */
export const SuccessProjectView: React.FC = () => {
  const { currentProjectContext, resetChat, stage } = useChatStore();
  const { session } = useAuthStore();
  
  // Partículas con valores determinísticos para evitar impurezas en el render (Math.random)
  const particles = [
    { id: 1, x: 80, y: -90, delay: 0.2, scale: 0.8 },
    { id: 2, x: -60, y: -120, delay: 0.5, scale: 0.6 },
    { id: 3, x: 110, y: -50, delay: 0.8, scale: 0.9 },
    { id: 4, x: -90, y: -70, delay: 0.1, scale: 0.7 },
    { id: 5, x: 50, y: -140, delay: 0.4, scale: 0.5 },
    { id: 6, x: -40, y: -100, delay: 0.7, scale: 0.85 },
    { id: 7, x: 120, y: -130, delay: 0.3, scale: 0.65 },
    { id: 8, x: -110, y: -60, delay: 0.6, scale: 0.75 },
    { id: 9, x: 0, y: -160, delay: 0.9, scale: 0.95 },
    { id: 10, x: 40, y: -150, delay: 0.25, scale: 0.6 },
  ];

  if (stage !== "project_saved") return null;

  const isGuest = !session;
  const projectName = currentProjectContext?.project_name || "Proyecto WADI";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl overflow-hidden"
    >
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-tr from-indigo-600/20 via-emerald-500/10 to-transparent blur-[150px] rounded-full"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-2xl w-full text-center space-y-12 relative">
        {/* Main Icon Celebration */}
        <motion.div variants={itemVariants} className="relative inline-block">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="p-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.5)] mx-auto relative z-10 border border-white/20"
          >
            <PartyPopper size={80} className="text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]" />
            <motion.div 
               animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -top-4 -right-4 p-2 bg-white rounded-full text-emerald-600 shadow-xl"
            >
              <Sparkles size={24} />
            </motion.div>
          </motion.div>
          
          {/* Particles Explosion */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0, p.scale, p.scale, 0], 
                  x: p.x, 
                  y: p.y,
                  rotate: 360
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 w-4 h-4 rounded-lg bg-white/30 backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                style={{ clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" }} // Star shape
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex flex-col items-center gap-2">
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Sincronización Exitosa
            </motion.div>
            
            <h2 className="text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] drop-shadow-2xl">
              ¡{projectName} <br/>
              <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Cristalizado!</span>
            </h2>
          </div>
          
          <p className="text-slate-400 text-xl max-w-lg mx-auto leading-relaxed font-medium">
            WADI ha finalizado el destilado neural. Tu idea ya no es aire, ahora es una <span className="text-white">estrategia ejecutable</span>.
          </p>
        </motion.div>

        {/* Guest Interaction Banner - More Premium */}
        {isGuest && (
          <motion.div 
            variants={itemVariants}
            className="group relative p-8 bg-gradient-to-r from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row items-center gap-6 text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative p-5 bg-amber-500/20 rounded-[1.5rem] text-amber-500 shadow-inner">
              <ShieldAlert size={32} className="animate-pulse" />
            </div>
            
            <div className="relative flex-1">
              <p className="text-base font-black text-amber-200 uppercase tracking-widest mb-1">Mente Local (Modo Guest)</p>
              <p className="text-sm text-amber-400/80 leading-relaxed font-semibold">
                Este blueprint vive en tu navegador. <span className="text-white underline decoration-amber-500/50 cursor-pointer">Registrate ahora</span> para persistirlo en la nube y desbloquear el agente de despliegue.
              </p>
            </div>
            
            <ChevronRight size={24} className="text-amber-500/50 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        )}

        {/* Large Action Buttons */}
        <motion.div variants={itemVariants} className="pt-4">
          <div className="flex flex-col md:flex-row gap-5 items-center justify-center">
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-7 bg-white text-slate-950 hover:bg-indigo-50 rounded-[2rem] font-black transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] group active:scale-95"
            >
              <LayoutDashboard size={24} />
              EXPLORAR DASHBOARD
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => {
                resetChat();
                useLogStore.getState().addLog("Iniciando nueva exploración neural...", "info");
              }}
              className="w-full md:w-auto flex items-center justify-center gap-4 px-12 py-7 bg-slate-900/50 hover:bg-slate-900 text-white rounded-[2rem] font-black transition-all border border-slate-800 backdrop-blur-sm active:scale-95 group"
            >
              <PlusCircle size={24} className="group-hover:rotate-90 transition-transform" />
              NUEVO PROYECTO
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-12">
           <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 uppercase tracking-[0.5em] font-bold opacity-40">
             <div className="w-12 h-[1px] bg-slate-800" />
             Destilado por WADI <ExternalLink size={14} className="mb-0.5" /> 2026
             <div className="w-12 h-[1px] bg-slate-800" />
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
