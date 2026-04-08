import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { 
  CheckCircle2, 
  LayoutDashboard, 
  Share2, 
  PlusCircle, 
  ExternalLink,
  ChevronRight,
  ShieldAlert
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

  const isGuest = !localStorage.getItem("sb-pghfndxqlwzjvxvztpzu-auth-token") && !!localStorage.getItem("wadi_pending_blueprint");
  const projectName = currentProjectContext?.project_name || "Proyecto WADI";

  const handleShare = () => {
    const text = `WADI Blueprint: ${projectName}\nStack: ${currentProjectContext?.tech_stack?.join(", ")}\nSummary: ${currentProjectContext?.summary}`;
    navigator.clipboard.writeText(text);
    useLogStore.getState().addLog("¡Blueprint copiado al portapapeles!", "success");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 20 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl overflow-hidden"
    >
      {/* Decorative Animated Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="max-w-xl w-full text-center space-y-8">
        {/* Success Icon Animation */}
        <motion.div variants={itemVariants} className="relative inline-block">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 } as any}
            className="p-8 bg-emerald-500 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.3)] mx-auto"
          >
            <CheckCircle2 size={64} className="text-white" />
          </motion.div>
          {/* Confetti-like particles using Framer Motion */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: p.x, y: p.y }}
              transition={{ duration: 1.5, repeat: Infinity, delay: p.delay, repeatDelay: 1 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-indigo-400"
            />
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          <h1 className="text-sm font-black uppercase tracking-[0.4em] text-emerald-400">Objetivo Cristalizado</h1>
          <h2 className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-white via-indigo-100 to-slate-400 bg-clip-text text-transparent uppercase leading-tight">
            {projectName}
          </h2>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            WADI ha procesado la visión y ha instanciado la estructura base en tu dashboard. El plan estratégico ya es ejecutable.
          </p>
        </motion.div>

        {/* Guest Interaction Banner */}
        {isGuest && (
          <motion.div 
            variants={itemVariants}
            className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row items-center gap-4 text-left backdrop-blur-md"
          >
            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-1">Misión en Custodia Local</p>
              <p className="text-[11px] text-amber-400/80 leading-snug">El blueprint se encuentra en tu memoria local. Registrate para desbloquear el <strong>Genome Dashboard</strong> y la sincronización en la nube.</p>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.href = "/dashboard"}
              className="flex items-center justify-center gap-2 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black transition-all shadow-xl shadow-indigo-600/20 group"
            >
              <LayoutDashboard size={20} />
              IR AL DASHBOARD
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-8 py-5 bg-slate-800/50 hover:bg-slate-800 text-white rounded-3xl font-black transition-all border border-slate-700 backdrop-blur-sm"
            >
              <Share2 size={20} />
              COMPARTIR LINK
            </button>
          </div>

          <button 
            onClick={() => {
              resetChat();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-400 rounded-3xl font-bold transition-all border border-white/5 hover:border-emerald-500/20"
          >
            <PlusCircle size={18} />
            INICIAR NUEVA IDEA
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="pt-6">
           <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] flex items-center justify-center gap-2 opacity-60">
             Destilado por WADI Intelligence <ExternalLink size={10} /> 2026
           </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
