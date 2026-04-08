import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { 
  LayoutDashboard, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  PartyPopper
} from "lucide-react";
import { useLogStore } from "../store/logStore";

/**
 * SuccessProjectView
 * Celebra la cristalización exitosa del proyecto.
 * Aparece cuando el stage es 'project_saved'.
 */
export const SuccessProjectView: React.FC = () => {
  const { currentProjectContext, resetChat, stage } = useChatStore();
  
  // Static stable offsets to avoid Math.random impurity lints during render
  const particles = [
    { id: 1, x: 80, y: -90, delay: 0.2 },
    { id: 2, x: -60, y: -120, delay: 0.5 },
    { id: 3, x: 110, y: -50, delay: 0.8 },
    { id: 4, x: -90, y: -70, delay: 0.1 },
    { id: 5, x: 50, y: -140, delay: 0.4 },
    { id: 6, x: -40, y: -100, delay: 0.7 },
    { id: 7, x: 120, y: -130, delay: 0.3 },
    { id: 8, x: -110, y: -60, delay: 0.6 },
  ];

  if (stage !== "project_saved") return null;

  // Detect guest by checking for pending blueprint in storage when no session is active
  // This is a heuristic until we have a proper auth state in store
  const isGuest = !!localStorage.getItem("wadi_pending_blueprint");
  const projectName = currentProjectContext?.project_name || "Proyecto WADI";

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 12 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-3xl overflow-hidden"
    >
      {/* Decorative Animated Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[180px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.8, 1], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/15 blur-[140px] rounded-full"
        />
      </div>

      <div className="max-w-xl w-full text-center space-y-10 relative">
        {/* Success Icon Animation */}
        <motion.div variants={itemVariants} className="relative inline-block">
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
            className="p-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full shadow-[0_0_80px_rgba(16,185,129,0.4)] mx-auto relative z-10"
          >
            <PartyPopper size={72} className="text-white drop-shadow-lg" />
          </motion.div>
          
          {/* Circular Glow Effect */}
          <div className="absolute inset-0 bg-emerald-500/40 blur-[40px] rounded-full -z-0 scale-150 animate-pulse" />

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: p.x, y: p.y }}
              transition={{ duration: 2, repeat: Infinity, delay: p.delay, repeatDelay: 0.5 }}
              className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
            />
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <motion.div
             initial={{ opacity: 0, letterSpacing: "0.1em" }}
             animate={{ opacity: 1, letterSpacing: "0.4em" }}
             transition={{ duration: 1 }}
             className="text-xs font-black uppercase text-emerald-400"
          >
            Misión Cumplida
          </motion.div>
          
          <h2 className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-white via-indigo-100 to-emerald-200 bg-clip-text text-transparent uppercase leading-tight drop-shadow-2xl">
            ¡{projectName} ha sido cristalizado!
          </h2>
          
          <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed font-medium">
            WADI ha procesado tu idea al 100%. Los cimientos de tu próximo proyecto están listos para la acción.
          </p>
        </motion.div>

        {/* Guest Interaction Banner */}
        {isGuest && (
          <motion.div 
            variants={itemVariants}
            className="group p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-5 text-left backdrop-blur-xl shadow-inner cursor-default"
          >
            <div className="p-4 bg-amber-500/20 rounded-2xl text-amber-500 animate-bounce">
              <ShieldAlert size={28} />
            </div>
            <div>
              <p className="text-sm font-black text-amber-200 uppercase tracking-widest mb-1">Custodia Local Detectada</p>
              <p className="text-xs text-amber-400/90 leading-relaxed font-semibold">
                Tu proyecto está a salvo en <span className="text-white">LocalStorage</span>. ¡Crea una cuenta para sincronizarlo con el Dashboard Global!
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="flex items-center justify-center gap-3 px-10 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black transition-all shadow-2xl shadow-indigo-600/30 group active:scale-95"
            >
              <LayoutDashboard size={24} />
              VER MI ROADMAP
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => {
                resetChat();
                useLogStore.getState().addLog("Iniciando nueva exploración neural...", "info");
              }}
              className="flex items-center justify-center gap-3 px-10 py-6 bg-slate-800/60 hover:bg-slate-800 text-white rounded-[2rem] font-black transition-all border border-slate-700 backdrop-blur-sm active:scale-95"
            >
              <PlusCircle size={24} />
              NUEVA IDEA
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-8">
           <p className="text-[11px] text-slate-600 uppercase tracking-[0.4em] flex items-center justify-center gap-3 opacity-50 font-bold">
             Destilado por WADI <ExternalLink size={12} /> 2026
           </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
