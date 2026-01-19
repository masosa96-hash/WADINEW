import { useEffect } from "react";
import { useRunsStore } from "../../store/runsStore";

export default function RunList({ projectId }: { projectId: string }) {
  const { runs, fetchRuns, loading } = useRunsStore();

  useEffect(() => {
    fetchRuns(projectId);
  }, [projectId]);

  if (loading && runs.length === 0) return <div className="p-4 text-wadi-muted text-center animate-pulse">Cargando bitácora...</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      {runs.length === 0 && !loading && (
        <div className="text-center py-10 border-2 border-dashed rounded-xl border-gray-100 flex flex-col items-center gap-2">
           <span className="text-2xl opacity-20">📜</span>
           <p className="text-sm text-gray-400">No hay ejecuciones todavía.</p>
           <p className="text-xs text-gray-300">Tirale una orden a WADI para empezar.</p>
        </div>
      )}
      {runs.map((run) => (
        <div key={run.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
            <span className="text-[10px] font-mono text-gray-400">{new Date(run.created_at).toLocaleString()}</span>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium uppercase tracking-wider">{run.model || 'AI'}</span>
          </div>
          <div className="mb-3">
             <p className="text-sm font-medium text-gray-800 flex gap-2"> 
                <span className="text-blue-500 shrink-0">→</span> 
                {run.input}
             </p>
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border-l-2 border-blue-200 whitespace-pre-wrap font-mono text-xs leading-relaxed">
            {run.output}
          </div>
        </div>
      ))}
    </div>
  );
}
