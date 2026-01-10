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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <header className="mb-6">
        <Link to="/projects" className="text-gray-400 hover:text-white text-sm mb-2 inline-block">
          &larr; Back to Projects
        </Link>
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-white">Project Workspace</h1>
             <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
        <div className="text-gray-500 text-xs mt-1">ID: {id}</div>
      </header>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded mb-6">
          Error: {error}
        </div>
      )}

      <div className="mb-8">
        <RunInputForm onSubmit={handleRun} loading={loading} />
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Run History</h2>
      
      {loading && runs.length === 0 ? (
          <div className="text-center py-8">Loading history...</div>
      ) : (
          <RunHistoryList runs={runs} />
      )}
    </div>
  );
}

