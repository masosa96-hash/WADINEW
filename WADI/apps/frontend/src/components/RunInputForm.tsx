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
    <form onSubmit={handleSubmit} className="relative group bg-wadi-base border border-wadi-border/50 rounded-md transition-all focus-within:border-wadi-accent/50 focus-within:bg-wadi-surface/30">
        <div className="flex">
            <div className="shrink-0 pl-3 pt-3 text-wadi-accent/70 select-none font-mono text-sm font-bold">
                $
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter instructions..."
                className="w-full wadi-input min-h-[60px] bg-transparent border-none focus:ring-0 resize-y transition-all text-sm font-mono scrollbar-thin pl-2 pt-3"
                disabled={loading}
                autoFocus
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                }}
            />
        </div>

      <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {loading && <span className="text-[10px] text-wadi-accent animate-pulse font-mono uppercase">Processing</span>}
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-[10px] text-wadi-muted hover:text-wadi-accent uppercase tracking-wider font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-2"
          >
            [ENTER] TO EXECUTE
          </button>
      </div>
    </form>
  );
}
