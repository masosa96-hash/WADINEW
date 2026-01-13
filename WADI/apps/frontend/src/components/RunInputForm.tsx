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
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="> Enter command or instructions..."
        className="relative w-full wadi-input min-h-[80px] bg-wadi-base focus:bg-wadi-surface/50 border-wadi-border focus:border-wadi-accent/50 resize-y transition-all text-sm font-mono scrollbar-thin"
        disabled={loading}
        autoFocus
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {loading && <span className="text-[10px] text-wadi-accent animate-pulse font-mono uppercase">Processing</span>}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-wadi-surface border border-wadi-border hover:bg-wadi-accent hover:text-wadi-base hover:border-wadi-accent text-wadi-muted transition-all px-3 py-1 rounded text-xs font-mono uppercase tracking-wide disabled:opacity-30 disabled:cursor-not-allowed"
          >
            EXECUTE
          </button>
      </div>
    </form>
  );
}
