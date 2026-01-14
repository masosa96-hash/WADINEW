import { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";
import RunHistoryList from "../components/RunHistoryList";
import RunInputForm from "../components/RunInputForm";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { runs, loading, error, fetchRuns, createRun, clearRuns } = useRunsStore();
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
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto pb-32 pt-6">
        {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            Error: {error}
            </div>
        )}

        <div className="max-w-3xl mx-auto px-4">
            {runs.length > 0 ? (
                <RunHistoryList runs={runs} />
            ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-gray-200 to-gray-100 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-wadi-text">¿En qué trabajamos hoy?</h3>
                        <p className="text-sm text-wadi-muted mt-1">WADI está listo para colaborar.</p>
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 px-4">
        <div className="max-w-3xl mx-auto">
            <RunInputForm 
                onSubmit={handleRun}
                loading={loading}
            />
        </div>
      </div>
    </div>
  );
}
