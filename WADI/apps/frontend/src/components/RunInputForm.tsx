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
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your prompt here..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 pr-12 focus:outline-none focus:border-blue-500 min-h-[100px] resize-y text-white"
        disabled={loading}
        onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <button
        type="submit"
        disabled={loading || !input.trim()}
        className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
      >
        {loading ? "Running..." : "Run"}
      </button>
    </form>
  );
}
