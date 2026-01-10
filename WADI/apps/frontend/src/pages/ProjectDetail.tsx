import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();

  useEffect(() => {
    if (id) fetchRuns(id);
    return () => clearRuns();
  }, [id, fetchRuns, clearRuns]);

  const handleRun = async (input: string) => {
    if (id) {
        await createRun(id, input);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8 relative z-10">
        <Link 
          to="/projects" 
          className="inline-flex items-center text-slate-400 hover:text-blue-400 text-sm mb-4 transition-colors group"
        >
          <span className="mr-1 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Projects
        </Link>
        <div className="flex justify-between items-end glass-panel p-6 mb-2">
             <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Project Workspace
                </h1>
                <div className="text-xs font-mono text-slate-500 mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                    ID: {id}
                </div>
             </div>
             <span className="text-sm font-medium text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                {user?.email}
             </span>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          ⚠️ Error: {error}
        </div>
      )}

      <div className="mb-10 relative z-20">
        <RunInputForm onSubmit={handleRun} loading={loading} />
      </div>

      <div className="relative z-10">
        <h2 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
            Run History 
            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                {runs.length}
            </span>
        </h2>
      
        {loading && runs.length === 0 ? (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        ) : (
            <RunHistoryList runs={runs} />
        )}
      </div>
    </div>
  );
}

