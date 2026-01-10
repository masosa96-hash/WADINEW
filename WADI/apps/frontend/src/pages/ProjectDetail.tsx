import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuthStore();
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchRuns(id);
    return () => clearRuns();
  }, [id, fetchRuns, clearRuns]);

  const handleRun = async (input: string) => {
    if (id) {
        await createRun(id, input);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl h-screen flex flex-col">
      <header className="flex justify-between items-center mb-6 relative z-10 glass-panel p-4">
        <div className="flex items-center gap-3">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <h1 className="text-xl font-bold tracking-tight text-white">
                WADI <span className="opacity-50 font-normal">TERMINAL</span>
             </h1>
        </div>
        
        <div className="flex items-center gap-4">
             <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">
                USER: {user?.email}
             </span>
             <button 
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase font-mono tracking-wider"
            >
                [Logout]
             </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 backdrop-blur-sm">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Main Content Area - Flexible height to push footer down */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
          
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             {loading && runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-sm font-mono text-blue-400">CONNECTING NEURAL LINK...</p>
                </div>
            ) : (
                <RunHistoryList runs={runs} />
            )}
        </div>

        {/* Input Area (Fixed at bottom via flex layout) */}
        <div className="mb-4">
            <RunInputForm onSubmit={handleRun} loading={loading} />
        </div>

      </div>
    </div>
  );
}

