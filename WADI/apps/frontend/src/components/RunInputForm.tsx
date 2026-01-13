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
    <form onSubmit={handleSubmit} className="relative w-full max-w-4xl mx-auto">
        <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type straight to the point..."
            className="w-full bg-transparent text-xl font-sans placeholder:text-wadi-muted/20 text-wadi-text resize-none outline-none min-h-[56px] py-3 px-0 border-b border-black/5 focus:border-black/20 transition-all font-light"
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
        <div className="flex justify-between items-center px-2 mt-2 opacity-0 focus-within:opacity-100 transition-opacity duration-500">
             <span className="text-[10px] text-wadi-muted/40 font-medium">Use Enter to submit, Shift+Enter for new line</span>
             {loading && <span className="text-[10px] text-wadi-accent animate-pulse font-medium">Processing...</span>}
        </div>
    </form>
  );
}
