interface Run {
  id: string;
  input: string;
  output: string;
  model: string;
  created_at: string;
}

export default function RunHistoryList({ runs }: { runs: Run[] }) {
  if (runs.length === 0) {
    return (
      <div className="glass-panel text-center text-slate-500 py-16 border-dashed border-2 border-slate-700/30">
        No runs yet. Start by entering a prompt above.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {runs.map((run) => (
        <div key={run.id} className="glass-panel overflow-hidden transition-all hover:border-slate-600/50">
          <div className="bg-slate-900/30 p-3 border-b border-slate-700/30 flex justify-between items-center backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                {new Date(run.created_at).toLocaleString()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-900/30 text-blue-300 border border-blue-500/20 font-mono">
                {run.model}
            </span>
          </div>
          
          <div className="p-5 space-y-4">
            <div>
                <strong className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">Input</strong>
                <div className="text-slate-200 whitespace-pre-wrap font-light leading-relaxed">{run.input}</div>
            </div>
            
            <div className="relative">
                 <div className="absolute -left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r"></div>
                 <strong className="text-xs uppercase tracking-wider text-blue-400 mb-2 block pl-2">Output</strong>
                 <div className="text-slate-100 whitespace-pre-wrap font-mono text-sm bg-slate-950/50 p-4 rounded-xl border border-slate-800 shadow-inner">
                    {run.output}
                 </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
