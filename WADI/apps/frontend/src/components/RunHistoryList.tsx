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
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] opacity-40 select-none">
            <div className="w-16 h-16 border border-wadi-accent rounded-full grid place-items-center mb-6 animate-pulse-slow">
                <div className="w-2 h-2 bg-wadi-accent rounded-full"></div>
            </div>
            
            <h3 className="text-lg font-mono font-bold text-wadi-text tracking-widest mb-1">SYSTEM_READY</h3>
            <p className="text-xs font-mono text-wadi-muted uppercase mb-8">Awaiting Input Stream</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full px-4">
                {[
                    "Initialize Analysis",
                    "Debug Component",
                    "Refactor Module",
                    "Explain Architecture"
                ].map((hint, i) => (
                    <div key={i} className="border border-wadi-border/50 p-3 rounded flex items-center gap-3">
                        <span className="text-wadi-accent/50 text-xs">$</span>
                        <span className="text-xs font-mono text-wadi-muted">{hint}</span>
                    </div>
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
    <div className="space-y-8 pb-4">
      {sortedRuns.map((run) => (
        <div key={run.id} className="flex flex-col gap-2 font-mono text-sm leading-relaxed group">
          
          {/* USER COMMAND */}
          <div className="flex gap-3 text-wadi-accent/80 border-l-2 border-wadi-accent/20 pl-3 py-1 bg-wadi-surface/10">
             <span className="shrink-0 pt-0.5 select-none opacity-50">$</span>
             <p className="whitespace-pre-wrap">{run.input}</p>
          </div>

          {/* WADI RESPONSE */}
          <div className="pl-6 pr-2 text-wadi-text/90 relative">
             <div className="absolute left-0 top-0 bottom-0 w-px bg-wadi-border/50"></div>
             <p className="whitespace-pre-wrap text-sm">{parseOutput(run.output)}</p>
             
             {/* Meta Footer */}
             <div className="mt-2 text-[9px] text-wadi-muted/30 uppercase tracking-wider flex gap-2 select-none opacity-0 group-hover:opacity-100 transition-opacity">
                <span>:: BYTES_RCVD</span>
                <span>•</span>
                <span>{new Date(run.created_at).toLocaleTimeString()}</span>
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}
