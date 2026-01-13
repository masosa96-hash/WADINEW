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
    <div className="space-y-12 pb-12 pt-6">
      {sortedRuns.map((run) => (
        <div key={run.id} className="flex flex-col gap-3 group">
          
          {/* USER COMMAND - Minimal & Airy */}
          <div className="flex gap-4 text-wadi-text px-2 opacity-80">
             <span className="shrink-0 font-medium opacity-30 select-none text-sm pt-0.5 max-w-[20px] text-right">You</span>
             <p className="whitespace-pre-wrap font-sans text-base leading-relaxed">{run.input}</p>
          </div>

          {/* WADI RESPONSE - Clean Text Block */}
          <div className="flex gap-4 px-2">
             <span className="shrink-0 font-medium text-wadi-accent opacity-80 select-none text-sm pt-0.5 max-w-[20px] text-right">AI</span>
             <div className="text-wadi-text font-sans text-base leading-relaxed max-w-none prose prose-p:my-2 prose-headings:font-medium prose-code:text-sm prose-code:bg-0 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-100 prose-pre:shadow-none prose-pre:rounded-sm">
                {parseOutput(run.output)}
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}
