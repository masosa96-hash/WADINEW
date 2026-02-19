import { useEffect, useState } from "react";
import { API_URL } from "./config/api";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import { KeepAlive } from "./components/KeepAlive";

function App() {
  const { initializeAuth, loading } = useAuthStore();

  /* New Health Gate */
  const [isSystemHealthy, setIsSystemHealthy] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
     const checkHealth = async () => {
        try {
           const res = await fetch(`${API_URL}/api/health`);
           if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
           setIsSystemHealthy(true);
        } catch (e) {
           console.error("[WADI Health] Failed:", e);
           setHealthError("No se pudo conectar con el servidor WADI. Por favor recarga la página.");
        }
     };
     checkHealth();
  }, []);

  useEffect(() => {
    if (isSystemHealthy) {
        initializeAuth();
    }
  }, [initializeAuth, isSystemHealthy]);

  if (healthError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-red-500 font-mono text-sm space-y-4 p-4 text-center">
            <div className="text-xl">⚠️ ERROR DE CONEXIÓN</div>
            <p>{healthError}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 rounded hover:bg-red-200 transition-colors"
            >
                Reintentar
            </button>
        </div>
      );
  }

  if (!isSystemHealthy) {
     return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-400 font-mono text-sm space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-gray-200 animate-spin" />
            <p>Conectando con el Núcleo WADI...</p>
        </div>
     );
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-wadi-base text-wadi-muted font-mono animate-pulse">SYSTEM_LOADING...</div>;
  }

  return (
    <div className="min-h-screen bg-wadi-base text-wadi-text font-sans">
       <KeepAlive />
       <Outlet />
    </div>
  );
}

export default App;
