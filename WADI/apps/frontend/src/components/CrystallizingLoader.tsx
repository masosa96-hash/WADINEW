import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { Sparkles, Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Destilando arquitectura...",
  "Validando stack técnico...",
  "Mapeando hitos del proyecto...",
  "Sincronizando modelos neuronales...",
  "Cristalizando visión estratégica...",
  "Afinando dimensiones del producto...",
  "Orquestando dependencias...",
  "Buscando fallos en la lógica..."
];

/**
 * CrystallizingLoader
 * Un cargador sofisticado que aparece durante la metamorfosis del proyecto.
 * Cambia su comportamiento y estética según la etapa actual de WADI.
 */
export const CrystallizingLoader: React.FC = () => {
  const { isTyping, stage } = useChatStore();
  const [message, setMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    if (!isTyping) return;

    const interval = setInterval(() => {
      const nextMsg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
      setMessage(nextMsg);
    }, 2800);

    return () => clearInterval(interval);
  }, [isTyping]);

  // Solo mostrar si WADI está escribiendo y no estamos en la fase inicial de exploración
  if (!isTyping || stage === "exploration") return null;

  // Determinar colores y estilos según la etapa
  const isClarifying = stage === "clarification";
  const accentColor = isClarifying ? "text-amber-400" : "text-emerald-400";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-4 px-6 py-4 backdrop-blur-md border border-slate-700/30 rounded-2xl mb-4 shadow-xl relative overflow-hidden ${
          isClarifying ? "bg-amber-400/10" : "bg-emerald-400/10"
        }`}
      >

        {/* Indicador visual de carga */}
        <div className="relative shrink-0">
          <motion.div
            animate={isClarifying ? { scale: [1, 1.1, 1] } : { rotate: 360 }}
            transition={isClarifying 
              ? { repeat: Infinity, duration: 2, ease: "easeInOut" } 
              : { repeat: Infinity, duration: 3, ease: "linear" }
            }
            className={`${accentColor} relative z-10`}
          >
            {isClarifying ? <Sparkles size={20} /> : <Loader2 size={20} />}
          </motion.div>
          
          {/* Partículas / Pulso extra */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute inset-0 rounded-full border-2 border-current ${accentColor} opacity-20 -z-10`}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-0.5">
            WADI {stage === "clarification" ? "Investigando" : "Construyendo"}
          </span>
          <motion.p
            key={message}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-bold text-white truncate"
          >
            {message}
          </motion.p>
        </div>

        {/* Barra de progreso sutil indeterminada */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className={`w-1/3 h-full bg-gradient-to-r from-transparent via-current to-transparent ${accentColor}`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
