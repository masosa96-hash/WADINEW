import { useEffect, useState } from "react";
import { API_URL } from "./config/api";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { KeepAlive } from "./components/KeepAlive";

function App() {
  const { initializeAuth, setLoadingFalse } = useAuthStore();

  const [systemStatus, setSystemStatus] = useState<
    "checking" | "ok" | "error"
  >("checking");

  useEffect(() => {
    const runHealthCheck = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`);

        if (!res.ok) {
          throw new Error(`Health failed: ${res.status}`);
        }

        setSystemStatus("ok");

        // Inicializar auth pero SIN bloquear render
        await initializeAuth().catch(() => {
          console.error("Auth failed but continuing");
          setLoadingFalse();
        });

      } catch (err) {
        console.error("Health check error:", err);
        setSystemStatus("error");
      }
    };

    runHealthCheck();
  }, [initializeAuth, setLoadingFalse]);

  if (systemStatus === "checking") {
    return (
      <div className="flex h-screen items-center justify-center font-mono">
        Conectando con el Núcleo WADI...
      </div>
    );
  }

  if (systemStatus === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-500 font-mono">
        <p>❌ No se pudo conectar al backend</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 border px-4 py-2"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wadi-base text-wadi-text">
      <KeepAlive />
      <Outlet />
    </div>
  );
}

export default App;
