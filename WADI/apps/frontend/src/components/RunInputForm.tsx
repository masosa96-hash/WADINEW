import { useState } from "react";

interface Props {
  onSubmit: (input: string) => Promise<void>;
  loading: boolean;
}

export default function RunInputForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    await onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
        <div className="relative bg-white shadow-xl shadow-black/5 rounded-2xl border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Preguntale a WADI..."
                className="w-full bg-transparent text-lg font-sans placeholder:text-gray-400 text-gray-900 resize-none outline-none min-h-[60px] max-h-[200px] py-4 px-5 scrollbar-none"
                style={{ height: 'auto' }}
                disabled={loading}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
            <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50 border-t border-gray-50">
                 <div className="flex items-center gap-2">
                     {/* Future buttons: Attach, Voice, etc can go here */}
                 </div>
                 <div className="flex items-center gap-3">
                     {loading ? (
                         <span className="text-xs text-gray-500 animate-pulse font-medium">Pensando...</span>
                     ) : (
                         <span className="text-[10px] text-gray-400 font-medium">Enter para enviar</span>
                     )}
                     <button 
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                     >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                     </button>
                 </div>
            </div>
        </div>
    </form>
  );
}
