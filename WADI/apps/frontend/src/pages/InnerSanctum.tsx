import { useEffect, useState } from "react";
import { WadiTheme } from "../theme/wadi-theme";
import { Layout } from "../components/Layout";
import { supabase } from "../config/supabase";
import { useNavigate } from "react-router-dom";

interface Reflection {
  id: string;
  type: string;
  content: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  created_at: string;
}

export default function InnerSanctum() {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReflections = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role !== "ADMIN") {
          // Fake 404 for non-admins to maintain secrecy
          navigate("/404");
          return;
        }

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/inner-sanctum/reports`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setReflections(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReflections();
  }, [navigate]);

  if (loading)
    return <div className="p-8 font-mono text-xs">Decrypting...</div>;

  return (
    <Layout>
      <div className={`min-h-screen p-8 pt-24 ${WadiTheme.typography.mono}`}>
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="border-b border-dashed border-slate-700 pb-4 mb-8">
            <h1 className="text-xl text-[var(--wadi-primary)] uppercase tracking-[0.2em] mb-2">
              Inner Sanctum [Admin Layer]
            </h1>
            <p className="text-xs text-slate-500">
              WADI Neural Reflexion Logs. Confidential.
            </p>
          </header>

          <div className="grid gap-4">
            {reflections.length === 0 ? (
              <div className="text-slate-600 text-sm">
                No reflections generated yet. Run memory distiller.
              </div>
            ) : (
              reflections.map((r) => (
                <div
                  key={r.id}
                  className={`p-4 ${WadiTheme.effects.glass} rounded-sm border-l-2 ${
                    r.priority === "HIGH"
                      ? "border-red-500"
                      : r.priority === "LOW"
                        ? "border-slate-700"
                        : "border-[var(--wadi-primary)]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded">
                      {r.type}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {new Date(r.created_at).toLocaleDateString()}{" "}
                      {new Date(r.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {r.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-center gap-4 mt-12 pt-8 border-t border-slate-800 text-center">
            <button
              onClick={async () => {
                // eslint-disable-next-line no-alert
                if (!confirm("¿Archivar y limpiar mesa?")) return;
                const {
                  data: { session },
                } = await supabase.auth.getSession();
                await fetch(
                  `${import.meta.env.VITE_API_URL || ""}/api/inner-sanctum/archive`,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${session?.access_token}`,
                    },
                  }
                );
                window.location.reload();
              }}
              className={`text-xs px-4 py-2 border border-slate-700 rounded hover:bg-slate-800 text-slate-400 transition-colors uppercase tracking-widest`}
            >
              [Limpiar Mesa]
            </button>

            <button
              onClick={() => navigate("/journal")}
              className={`text-xs px-4 py-2 border border-[var(--wadi-primary)] rounded hover:bg-[var(--wadi-primary-dim)] text-[var(--wadi-primary)] transition-colors uppercase tracking-widest`}
            >
              Ver Historial (Journal)
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate("/chat")}
              className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              ← RETURN TO SURFACE
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
