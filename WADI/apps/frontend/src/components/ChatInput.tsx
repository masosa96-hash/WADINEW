import React, { useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isStreaming: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, handleSend, isStreaming }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajusta la altura del textarea automáticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [input]);

  return (
    <div className="fixed bottom-0 left-64 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent">
      <div className="max-w-3xl mx-auto relative">
        
        {/* Badge de Herramientas Rápidas (Sugerencia de Comandos) */}
        <AnimatePresence>
          {input.startsWith('/') && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-0 flex gap-2"
            >
              <span className="px-3 py-1 bg-wadi-black text-white text-[10px] font-wadi-mono rounded-lg flex items-center gap-2 shadow-sm">
                <Command size={10} /> FORGE_MODE
              </span>
              <span className="px-3 py-1 bg-white text-wadi-gray-500 text-[10px] font-wadi-mono rounded-lg border border-wadi-gray-200 shadow-sm">
                /analyze_repo
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenedor Principal del Input */}
        <div className="relative flex items-end gap-2 p-2 bg-white border border-wadi-gray-200 rounded-2xl shadow-xl focus-within:border-wadi-accent-end/50 transition-all">
          
          <button className="p-2 text-wadi-gray-400 hover:text-wadi-accent-start transition-colors rounded-xl hover:bg-wadi-gray-50 flex-shrink-0">
            <Paperclip size={20} />
          </button>

          <textarea
            id="chat-input"
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Escribe un comando o mensaje a WADI..."
            className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-sm font-wadi-sans text-wadi-gray-900 placeholder:text-wadi-gray-400 resize-none outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex items-center gap-1 pr-1 pb-1 flex-shrink-0">
            <div className="flex flex-col items-end mr-2">
                <span className="text-[9px] font-bold text-wadi-gray-300 uppercase tracking-tighter">Sync Mode</span>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-wadi-mono text-green-600">READY</span>
                </div>
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className={`p-2 rounded-xl transition-all ${
                input.trim().length > 0 && !isStreaming
                ? 'bg-wadi-black text-white hover:bg-wadi-gray-800 shadow-md active:scale-95' 
                : 'bg-wadi-gray-100 text-wadi-gray-400 cursor-not-allowed'
              }`}
            >
              <SendHorizontal size={20} />
            </button>
          </div>
        </div>
        
        <p className="text-center mt-3 text-[10px] text-wadi-gray-400 font-wadi-sans">
          WADI operará de forma <strong>síncrona</strong> y sin filtros restrictivos.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
