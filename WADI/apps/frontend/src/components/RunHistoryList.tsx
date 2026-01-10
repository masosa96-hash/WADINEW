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
      <div className="text-center text-gray-500 py-10">
        No runs yet. Start by entering a prompt above.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {runs.map((run) => (
        <div key={run.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-750 p-3 border-b border-gray-700 flex justify-between items-center bg-opacity-50">
            <span className="text-xs text-gray-400 font-mono">
                {new Date(run.created_at).toLocaleString()}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-blue-300">
                {run.model}
            </span>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
                <strong className="block text-green-400 text-sm mb-1">INPUT</strong>
                <div className="text-gray-300 whitespace-pre-wrap">{run.input}</div>
            </div>
            <div className="border-t border-gray-750 pt-4">
                 <strong className="block text-blue-400 text-sm mb-1">OUTPUT</strong>
                 <div className="text-white whitespace-pre-wrap font-mono text-sm bg-gray-900 p-3 rounded">
                    {run.output}
                 </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
