import { useRef } from "react";
import { useParams } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  // const { user, signOut } = useAuthStore(); // User scope moved to Sidebar
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();
  // const navigate = useNavigate(); // Navigation handled by Sidebar
  
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (id) fetchRuns(id);
    return () => clearRuns();
  }, [id, fetchRuns, clearRuns]);

  const handleRun = async (input: string) => {
    if (id) {
        await createRun(id, input);
        fetchRuns(id);
        setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-wadi-base relative p-4 lg:p-6 overflow-hidden">
      
      {/* Context info for this view - Minimal */}
      {/* We could push this to the TopBar via a portal later, but for now simple header */}
      <div className="flex justify-between items-center mb-2 shrink-0 px-2 pt-2">
         <div className="text-[10px] font-mono text-wadi-muted/50 uppercase tracking-widest">
            CTX :: {id?.slice(0,8)}
         </div>
         <div className="flex items-center gap-2">
            <span className={`w-1 h-1 rounded-full ${loading ? 'bg-wadi-accent animate-pulse' : 'bg-wadi-muted'}`}></span>
            <span className="text-[9px] font-mono text-wadi-muted uppercase">{loading ? 'BUSY' : 'READY'}</span>
         </div>
      </div>

      {error && (
        <div className="bg-wadi-error/10 text-wadi-error border border-wadi-error/50 p-2 rounded mb-4 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col relative bg-wadi-surface/30 rounded border border-wadi-border">
          
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto px-4 scrollbar-thin scroll-smooth pb-10">
          <RunHistoryList runs={runs} />
          <div ref={bottomRef} className="h-4" />
        </div>

        <div className="shrink-0 z-20 bg-white/50 backdrop-blur-sm -mx-6 px-6">
          <RunInputForm 
            onSubmit={handleRun}
            loading={loading}
          />
        </div>

      </div>
    </div>
  );
}
