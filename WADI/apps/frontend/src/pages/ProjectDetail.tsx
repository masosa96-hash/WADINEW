import { useRef, useEffect } from "react";
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
    <div className="flex flex-col h-full bg-transparent relative p-4 lg:p-6 overflow-hidden">
      
      {/* Context info for this view - Minimal */}
      {/* We could push this to the TopBar via a portal later, but for now simple header */}
      <div className="absolute top-4 right-4 z-40 opacity-0 hover:opacity-100 transition-opacity">
         <div className="text-[10px] font-mono text-wadi-muted/20 uppercase tracking-widest text-right">
            CTX :: {id?.slice(0,8)} <br/>
            {loading ? 'BUSY' : 'READY'}
         </div>
      </div>

      {error && (
        <div className="bg-wadi-error/10 text-wadi-error border border-wadi-error/50 p-2 rounded mb-4 text-xs font-mono">
          ERROR: {error}
        </div>
      )}

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative">
          
        {/* Output Area */}
        <div className="flex-1 overflow-y-auto scrollbar-none pb-10 mask-fade-top">
  {runs.length > 0 ? (
    <RunHistoryList runs={runs} />
  ) : (
    <div className="text-wadi-muted text-center py-8">
      No hay ejecuciones todavía. Usa el formulario abajo para crear una.
    </div>
  )}
  <div ref={bottomRef} className="h-10" />
</div>

        <div className="shrink-0 z-20 w-full pb-6 pt-2">
          <RunInputForm 
            onSubmit={handleRun}
            loading={loading}
          />
        </div>

      </div>
    </div>
  );
}
