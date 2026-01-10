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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-500 blur"></div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your prompt here... (Shift+Enter for new line)"
        className="relative w-full bg-slate-900 text-white placeholder-slate-500 rounded-xl p-6 pr-24 focus:outline-none min-h-[120px] resize-y shadow-2xl transition-all"
        disabled={loading}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {loading && <span className="text-xs text-blue-400 animate-pulse font-mono">PROCESSING...</span>}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50 disabled:grayscale"
          >
            Run &rarr;
          </button>
      </div>
    </form>
  );
}
