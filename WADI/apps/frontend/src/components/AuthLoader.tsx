import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuthStore } from "../store/useAuthStore";

export const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const { setUser, loginAsGuest } = useAuthStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[WADI_AUTH]: Iniciando AuthLoader...");
    
    // Failsafe timeout: Force entry after 5s if stuck
    const failsafe = setTimeout(() => {
      setReady((currentReady) => {
        if (!currentReady) {
          console.warn("[WADI_AUTH]: Carga inicial excedió el tiempo límite, forzando entrada.");
          return true; // Force ready
        }
        return currentReady;
      });
    }, 5000);

    // Timeout to detect if Supabase is hanging (Visual feedback)
    const visualTimeout = setTimeout(() => {
      setReady((currentReady) => {
        if (!currentReady) {
          setError("La conexión con el búnker está tardando demasiado. Verifica tu conexión.");
        }
        return currentReady;
      });
    }, 15000);

    // 1. Initial Check
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log("[WADI_AUTH]: Sesión recuperada:", session?.user?.id || "None");
        setUser(session?.user || null);
        
        // Ensure the global store loading state is also updated
        useAuthStore.setState({ loading: false });

        if (!session) {
          console.log("[WADI_AUTH]: Sin sesión activa. Intentando login anónimo...");
          loginAsGuest()
            .then(({ data, error: loginErr }) => {
              if (loginErr) {
                console.error("[WADI_AUTH]: Guest login error:", loginErr);
                setError(`Error de identidad: ${loginErr.message}`);
              } else {
                console.log("[WADI_AUTH]: Guest login exitoso:", data.user?.id);
              }
              setReady(true);
            })
            .catch(err => {
              console.error("[WADI_AUTH]: Guest Exception:", err);
              setError("Fallo en login de emergencia.");
              setReady(true);
            });
        } else {
          console.log("[WADI_AUTH]: Usuario autenticado. Validando perfil...");
          try {
            // Test query to see if RLS allows reading the profile
            const { data: profile, error: pError } = await supabase
              .from("profiles")
              .select("id")
              .limit(1);
            
            console.log("[WADI_AUTH]: Resultado test perfil:", { profile, error: pError });
            setReady(true);
          } catch (e) {
            console.error("[WADI_AUTH]: Excepción validando perfil:", e);
            setReady(true); // Don't block
          }
        }
      })
      .catch(err => {
        console.error("[WADI_AUTH]: Session error:", err);
        setError("Error crítico de red. Revisa tu conexión.");
        useAuthStore.setState({ loading: false });
        setReady(true);
      });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      clearTimeout(failsafe);
      clearTimeout(visualTimeout);
      subscription.unsubscribe();
    };
  }, [setUser, loginAsGuest]); // Removed 'ready' to avoid infinite loops

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
