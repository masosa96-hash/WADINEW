import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";

interface Run {
  id: string;
  step_name: string;
  status: string;
  logs: string;
  error_message: string;
  created_at: string;
}

const ProjectBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuthStore();
  const token = session?.access_token;
  const navigate = useNavigate();

  const [runs, setRuns] = useState<Run[]>([]);
  const [isMaterializing, setIsMaterializing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      if (!token || !id) return;
      try {
        const res = await fetch(`${API_URL}/api/projects/${id}/runs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRuns(data);
        }
      } catch (err) {
        console.error("Failed to fetch runs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [id, token]);

  const handleMaterialize = async () => {
    if (!token || !id) return;
    setIsMaterializing(true);
    try {
      const res = await fetch(`${API_URL}/api/projects/${id}/materialize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Materialization failed");
      // fetchRuns is now implicitly handled by polling, but we can't call it here easily without making it stable
    } catch (err) {
      console.error(err);
      // alert is avoided by rule but here for dev feedback, using console.error mostly
    } finally {
      setIsMaterializing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-wadi-base p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-wadi-accent">Project Builder</h1>
          <p className="text-gray-400">Materialización de planos en código real</p>
        </div>
        <div className="flex gap-4">
          <button
             onClick={() => navigate(`/projects/${id}`)}
             className="px-4 py-2 border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            Volver al Chat
          </button>
          <button
            onClick={handleMaterialize}
            disabled={isMaterializing}
            className={`px-6 py-2 font-bold transition-all ${
              isMaterializing 
              ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
              : "bg-wadi-accent text-black hover:scale-105"
            }`}
          >
            {isMaterializing ? "CONSTRUYENDO..." : "MATERIALIZAR EN DISCO"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Terminal / Logs Section */}
        <div className="flex flex-col border border-gray-800 bg-black/50 overflow-hidden">
          <div className="bg-gray-900 px-4 py-2 text-xs font-mono text-gray-500 uppercase tracking-widest border-b border-gray-800">
            Execution Logs
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {loading ? (
              <p className="text-gray-600 animate-pulse">Cargando registros...</p>
            ) : runs.length === 0 ? (
              <p className="text-gray-600 italic">No hay ejecuciones registradas. Presioná "Materializar" para comenzar.</p>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="mb-4 border-l-2 border-gray-800 pl-4 py-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      run.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' :
                      run.status === 'FAILED' ? 'bg-red-500/20 text-red-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {run.status}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {new Date(run.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-bold text-gray-300">{run.step_name}</p>
                  {run.logs && <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap">{run.logs}</pre>}
                  {run.error_message && (
                    <p className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 border border-red-500/20">
                      Error: {run.error_message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Context / Tree Preview (Mock for now) */}
        <div className="flex flex-col border border-gray-800 bg-black/20 p-6">
          <h2 className="text-lg font-bold mb-4">Estructura del Proyecto</h2>
          <div className="text-gray-500 italic text-center py-20 border border-dashed border-gray-800">
            Previsualización del Árbol de Archivos
            <p className="text-xs mt-2">(WADI escribirá directamente en e:\WADINEW\projects\{id})</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilder;
