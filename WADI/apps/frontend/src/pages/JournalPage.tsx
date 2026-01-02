import { useEffect, useState } from "react";
import { WadiTheme } from "../theme/wadi-theme";
import { Layout } from "../components/Layout";
import { supabase } from "../config/supabase";
import { useNavigate } from "react-router-dom";

interface CloudReport {
  id: string;
  name: string;
  type: string;
  content: string; // Text content
  created_at: string;
}

export default function JournalPage() {
  const [reports, setReports] = useState<CloudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CloudReport | null>(
    null
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role !== "ADMIN") {
          navigate("/404");
          return;
        }

        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;

        // Fetch from API
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || ""}/api/journal/files`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [navigate]);

  if (loading)
    return (
      <div className="p-8 font-mono text-xs">Accessing Cloud Vault...</div>
    );

  return (
    <Layout>
      <div className={`min-h-screen p-8 pt-24 ${WadiTheme.typography.mono}`}>
        <div className="max-w-6xl mx-auto h-[80vh] flex flex-col md:flex-row gap-8">
          {/* SIDEBAR: File List */}
          <div className="w-full md:w-1/3 flex flex-col space-y-4">
            <header className="border-b border-dashed border-slate-700 pb-4">
              <h1 className="text-xl text-[var(--wadi-accent)] uppercase tracking-[0.2em] mb-2">
                Journal [Cloud]
              </h1>
              <p className="text-xs text-slate-500">
                WADI Evolution Logs (Read-Only)
              </p>
            </header>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {reports.length === 0 ? (
                <div className="text-slate-600 text-sm italic">
                  No reports archived.
                </div>
              ) : (
                reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    className={`w-full text-left p-3 rounded border text-xs transition-all ${
                      selectedReport?.id === r.id
                        ? "bg-[var(--wadi-surface-active)] border-[var(--wadi-accent)] text-[var(--wadi-accent)]"
                        : "bg-[var(--wadi-surface)] border-transparent text-slate-400 hover:bg-[var(--wadi-surface-active)]"
                    }`}
                  >
                    <div className="font-bold mb-1">{r.name}</div>
                    <div className="flex justify-between opacity-60">
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      <span>{r.type}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* MAIN: File Viewer */}
          <div
            className={`flex-1 ${WadiTheme.effects.glass} border border-[var(--wadi-border)] rounded p-6 flex flex-col relative`}
          >
            {selectedReport ? (
              <>
                <div className="absolute top-4 right-4 text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded">
                  READ_ONLY | ENCRYPTED
                </div>
                <h2 className="text-lg text-white mb-6 border-b border-slate-800 pb-4">
                  {selectedReport.name}
                </h2>
                <div className="flex-1 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300">
                  {selectedReport.content}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Select a file to decrypt.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
