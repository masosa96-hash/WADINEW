import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { session, loading } = useAuthStore();

  // Mientras auth se inicializa, mostrar spinner breve
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-wadi-muted font-mono">
        Cargando…
      </div>
    );
  }

  // Sin sesión → redirigir a login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
