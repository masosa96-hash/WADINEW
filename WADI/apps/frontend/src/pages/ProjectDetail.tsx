import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  // const { user, signOut } = useAuthStore(); // User scope moved to Sidebar
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();
  // const navigate = useNavigate(); // Navigation handled by Sidebar

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
    <div className="flex flex-col h-full bg-wadi-base relative p-4 lg:p-6 overflow-hidden">
      
      {/* Context info for this view - Minimal */}
      {/* We could push this to the TopBar via a portal later, but for now simple header */}
      <div className="flex justify-between items-center mb-4 shrink-0 border-b border-wadi-border/50 pb-2">
         <div className="flex items-center gap-2">
            <h2 className="text-sm font-mono text-wadi-accent uppercase tracking-widest">Active Session</h2>
            <span className="text-xs font-mono text-wadi-muted">:: {id?.slice(0,8)}</span>
         </div>
         {/* Status indicator */}
         <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-wadi-accent animate-pulse' : 'bg-wadi-muted'}`}></span>
            <span className="text-[10px] font-mono text-wadi-muted uppercase">{loading ? 'PROCESSING' : 'IDLE'}</span>
         </div>
      </div>

      {error && (
        <div className="bg-wadi-error/10 text-wadi-error border border-wadi-error/50 p-2 rounded mb-4 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-wadi-surface/30 rounded border border-wadi-border">
          
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-wadi-border scrollbar-track-transparent flex flex-col gap-4">
             {loading && runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-2">
                    <div className="w-2 h-2 bg-wadi-accent animate-ping rounded-full"></div>
                    <p className="text-xs font-mono text-wadi-muted uppercase tracking-widest">Initializing Context...</p>
                </div>
            ) : (
                <RunHistoryList runs={runs} />
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-wadi-border bg-wadi-base/50 backdrop-blur-sm">
            <RunInputForm onSubmit={handleRun} loading={loading} />
        </div>

      </div>
    </div>
  );
}

