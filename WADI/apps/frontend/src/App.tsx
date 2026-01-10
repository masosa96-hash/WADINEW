import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-900 text-white">Loading WADI...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
       <Outlet />
    </div>
  );
}

export default App;
