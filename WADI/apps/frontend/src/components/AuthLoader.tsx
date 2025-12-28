import { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuthStore } from "../store/authStore";

export const AuthLoader = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const { setUser, loginAsGuest } = useAuthStore();

  useEffect(() => {
    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);

      if (!session) {
        // If no user, login as guest automatically
        loginAsGuest().then(() => setReady(true));
      } else {
        setReady(true);
      }
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, loginAsGuest]);

  if (!ready) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-app)",
          color: "var(--text-primary)",
        }}
      >
        Preparando tu espacio de conversación...
      </div>
    );
  }

  return <>{children}</>;
};
