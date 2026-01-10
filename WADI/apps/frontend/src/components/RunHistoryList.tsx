interface Run {
  id: string;
  input: string;
  output: string;
  model: string;
  created_at: string;
}

export default function RunHistoryList({ runs }: { runs: Run[] }) {
  // Parsing helper
  const parseOutput = (text: string) => {
    try {
      // Try to parse as JSON first
      const json = JSON.parse(text);
      if (json.response) return json.response;
      return text;
    } catch {
      // If valid JSON, return response. If not (or simple text), return raw.
      // Also handle potential cleaner plain text if model falls back.
      return text;
    }
  };

  if (runs.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-2xl">
                💬
            </div>
            <p className="text-slate-500">No messages yet. Say hello.</p>
        </div>
    );
  }

  // Reverse runs to show oldest first (top) if the container scrolls to bottom?
  // Usually chat is bottom-up. Standard array map renders top-down. 
  // Assuming 'runs' comes sorted correctly from store or parent?
  // Store is .order("created_at", { ascending: false }); (Newest First).
  // For a chat app, usually we want Newest at Bottom. 
  // We should reverse them for display so it reads naturally like a log.
  const sortedRuns = [...runs].reverse();

  return (
    <div className="space-y-6 pb-4">
      {sortedRuns.map((run) => (
        <div key={run.id} className="flex flex-col gap-4">
          
          {/* USER BUBBLE (Right) */}
          <div className="flex justify-end">
             <div className="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                <p className="whitespace-pre-wrap leading-relaxed">{run.input}</p>
             </div>
          </div>

          {/* AI BUBBLE (Left) */}
          <div className="flex justify-start">
             <div className="max-w-[85%] bg-slate-800/80 text-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg border border-slate-700/50 backdrop-blur-sm">
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {parseOutput(run.output)}
                </p>
                {/* Optional Metadata Footer */}
                <div className="mt-2 pt-2 border-t border-white/5 opacity-50 flex justify-between items-center text-[10px]">
                    <span className="font-mono text-xs uppercase tracking-widest text-blue-400">WADI</span>
                    {/* <span className="font-mono">{run.model}</span> */}
                </div>
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}
