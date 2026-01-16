import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";

import { KeepAlive } from "./components/KeepAlive";

function App() {
  const { initializeAuth, loading } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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
