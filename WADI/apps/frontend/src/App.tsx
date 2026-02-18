import { useEffect, useState } from "react";
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
           // FIX: Default to the ACTUAL backend URL vs frontend URL to avoid infinite loops
           const API_URL = import.meta.env.VITE_API_URL || "https://wadi-api-u2vx.onrender.com";
           
           // Add timeout to prevent hanging forever
           const controller = new AbortController();
           const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for free tier wake-up

           const res = await fetch(`${API_URL.replace(/\/$/, "")}/health`, {
             signal: controller.signal
           });
           
           clearTimeout(timeoutId);

           if (res.ok) {
              setIsSystemHealthy(true);
           } else {
              throw new Error("Health check failed");
           }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Unknown Error";
            console.warn(`[WADI Health] Attempt ${retryCount + 1} failed:`, message);
            
            // Should we stop retrying eventually?
            // For now, infinite retry is "resilient", but maybe after 10 tries we show a manual button?
            if (retryCount > 10) {
               console.error("Giving up on auto-retry. Backend seems dead.");
               // We could set a "Dead" state here to show a different UI
            }

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
