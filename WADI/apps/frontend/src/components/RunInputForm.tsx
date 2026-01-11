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
    <form onSubmit={handleSubmit} className="relative group">
        {/* Removed decorative gradient for clean look */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu mensaje... (Shift+Enter para nueva línea)"
        className="relative w-full glass-input min-h-[100px] resize-y shadow-sm hover:shadow-md transition-all text-base"
        disabled={loading}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {loading && <span className="text-xs text-blue-500 animate-pulse font-medium">Processing...</span>}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary py-2 px-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Enviar</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.89 28.89 0 0015.293-7.154.75.75 0 000-1.115A28.89 28.89 0 003.105 2.289z" />
            </svg>
          </button>
      </div>
    </form>
  );
}
