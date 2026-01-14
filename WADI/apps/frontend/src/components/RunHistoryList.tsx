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
        <div className="flex flex-col items-center justify-center h-full min-h-[40vh] select-none opacity-0 animate-in fade-in duration-700">
            <h3 className="text-2xl font-sans font-normal text-wadi-muted/30 mb-2">Ready to create.</h3>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center max-w-md w-full px-4 text-wadi-muted/40 text-sm font-light">
                {["Analysis", "Debugging", "Architecture", "Refactoring"].map((hint, i) => (
                    <span key={i} className="cursor-default hover:text-wadi-muted/60 transition-colors">
                        {hint}
                    </span>
                ))}
            </div>
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
    <div className="space-y-6 pb-20 pt-6">
      {sortedRuns.map((run) => (
        <div key={run.id} className="flex flex-col gap-4 group">
          
          {/* USER COMMAND - Bubble */}
          <div className="flex justify-end pl-12">
             <div className="chat-bubble-user max-w-[85%] text-base leading-relaxed whitespace-pre-wrap">
                {run.input}
             </div>
          </div>

          {/* WADI RESPONSE - Plain Text */}
          <div className="flex gap-4 pr-4">
             <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 flex items-center justify-center text-white text-xs font-bold shadow-sm mt-6">
                W
             </div>
             <div className="chat-response-wadi flex-1 min-w-0 prose prose-slate prose-p:leading-7 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                {parseOutput(run.output)}
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}
