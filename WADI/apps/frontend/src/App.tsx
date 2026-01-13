import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-wadi-base text-wadi-muted font-mono animate-pulse">SYSTEM_LOADING...</div>;
  }

  return (
    <div className="min-h-screen bg-wadi-base text-wadi-text font-sans">
       <Outlet />
    </div>
  );
}

export default App;
