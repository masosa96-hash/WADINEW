import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuthStore } from "../store/useAuthStore";

export const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const { setUser, loginAsGuest } = useAuthStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Timeout to detect if Supabase is hanging
    const timeout = setTimeout(() => {
      if (!ready) {
        setError("La conexión con el búnker está tardando demasiado. ¿Están configuradas las variables de entorno?");
      }
    }, 10000);

    // 1. Initial Check
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user || null);

        if (!session) {
          loginAsGuest()
            .then(({ error: loginErr }) => {
              if (loginErr) {
                console.error("Guest login error:", loginErr);
                setError(`Error de autenticación: ${loginErr.message}`);
              }
              setReady(true);
            })
            .catch(err => {
              console.error("Anonymous login exception:", err);
              setError("Excepción en login anónimo. Revisa la consola.");
              setReady(true);
            });
        } else {
          setReady(true);
        }
      })
      .catch(err => {
        console.error("Session error:", err);
        setError("No se pudo conectar con Supabase. Verifica VITE_SUPABASE_URL.");
      });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setUser, loginAsGuest, ready]);

  if (!ready) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f0f11", // Hardcoded to match wadi-bg
          color: "#fafafa",           // Hardcoded to match wadi-text
          gap: "1.5rem",
          fontFamily: "var(--font-sans)",
          padding: "2rem",
          textAlign: "center"
        }}
      >
        {error ? (
          <div className="space-y-4 animate-enter">
            <div className="text-red-500 text-4xl mb-2">📡</div>
            <h1 className="text-xl font-bold uppercase tracking-tight">Fallo de Conexión</h1>
            <p className="text-sm opacity-70 max-w-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all"
            >
              REINTENTAR ACCESO
            </button>
          </div>
        ) : (
          <>
            <div className="animate-pulse-slow">
              <span className="text-xl tracking-widest font-bold">WADI</span>
            </div>
            <p className="opacity-50 text-sm">Preparando el búnker...</p>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
