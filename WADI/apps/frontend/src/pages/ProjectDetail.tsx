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
      <header className="flex justify-between items-center mb-6 relative z-10 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                W
             </div>
             <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-800">
                    WADI
                </h1>
                <p className="text-xs text-slate-500">AI Assistant</p>
             </div>
        </div>
        
        <div className="flex items-center gap-4">
             <span className="text-xs font-medium text-slate-500 hidden sm:inline-block bg-slate-100 px-3 py-1 rounded-full">
                {user?.email}
             </span>
             <button 
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-600 transition-colors uppercase font-medium tracking-wide"
            >
                Log out
            </button>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Main Content Area - Flexible height to push footer down */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10 bg-white/50 rounded-2xl border border-slate-200/50 shadow-sm">
          
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 mb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
             {loading && runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm font-medium text-slate-400">Loading chat...</p>
                </div>
            ) : (
                <RunHistoryList runs={runs} />
            )}
        </div>
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

