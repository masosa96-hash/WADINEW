import React from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { session } = useAuthStore();
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen text-wadi-muted">
        Cargando…
      </div>
    );
  }
  return children;
}
