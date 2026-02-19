import { useEffect, useState } from "react";
import { API_URL } from "./config/api";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import { KeepAlive } from "./components/KeepAlive";

function App() {
  const { initializeAuth, loading } = useAuthStore();

  /* New Health Gate */
  const [isSystemHealthy, setIsSystemHealthy] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
     const checkHealth = async () => {
        try {
           const res = await fetch(`${API_URL}/api/health`);

           if (!res.ok) throw new Error("Health check failed");

           setIsSystemHealthy(true);
        } catch {
           console.warn("[WADI Health] Retry...");
           setTimeout(() => setRetryCount(c => c + 1), 3000);
        }
     };
     checkHealth();
  }, [retryCount]);

  useEffect(() => {
    if (isSystemHealthy) {
        initializeAuth();
    }
  }, [initializeAuth, isSystemHealthy]);

  if (!isSystemHealthy) {
     return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-400 font-mono text-sm space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-gray-200 animate-spin" />
            <p>Conectando con el Núcleo WADI... (Puede tardar si está dormido)</p>
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
