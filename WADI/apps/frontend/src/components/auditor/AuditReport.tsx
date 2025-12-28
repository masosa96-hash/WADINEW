import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { API_URL } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useScouter } from "../../hooks/useScouter";
import { supabase } from "../../config/supabase";

interface Vulnerability {
  level: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
}

export function AuditReport() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playAlertSound } = useScouter();

  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return; // Wait for user

    const fetchAudit = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("NO_AUTH_TOKEN");

        const res = await fetch(
          `${API_URL}/api/conversations/${conversationId}/audit`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("AUDIT_REFUSED_BY_SYSTEM");

        const jsonData = await res.json();
        setVulnerabilities(jsonData.vulnerabilities || []);
      } catch (err) {
        console.error(err);
        setError("ERROR DE CONEXIÓN VITAL: No pude sincronizar con tu estado.");
        playAlertSound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudit();
  }, [conversationId, user, playAlertSound]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f111a] flex flex-col items-center justify-center p-4">
        <div className="animate-pulse text-[var(--wadi-primary)] font-mono-wadi text-xl tracking-[0.3em] uppercase">
          [SINCRONIZANDO REALIDAD...]
        </div>
        <div className="mt-4 w-64 h-1 bg-[var(--wadi-surface)] overflow-hidden rounded-full">
          <div className="h-full bg-[var(--wadi-primary)] animate-[shimmer_1s_infinite] w-1/3 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-[var(--wadi-text-muted)] text-xl font-bold font-mono-wadi mb-4">
          DESCONEXIÓN
        </h1>
        <p className="text-white font-mono-wadi text-sm">{error}</p>
        <Button
          onClick={() => navigate(-1)}
          className="mt-8 bg-[var(--wadi-surface)] text-white hover:bg-[var(--wadi-surface)]/80"
        >
          [VOLVER AL REFUGIO]
        </Button>
      </div>
    );
  }

  const highRiskCount = vulnerabilities.filter(
    (v) => v.level === "HIGH"
  ).length;
  const riskPercentage = Math.min(
    100,
    vulnerabilities.length * 20 + highRiskCount * 15
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f111a] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="w-full max-w-2xl border-b border-[var(--wadi-primary)]/30 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-light font-['Outfit'] text-[var(--wadi-primary)] tracking-widest uppercase">
            Mapa de Distorsión
          </h1>
          <p className="text-[var(--wadi-text-muted)] mt-2 font-mono-wadi text-xs uppercase">
            REF: {conversationId?.split("-")[0]} // ESTADO:{" "}
            {highRiskCount > 0 ? "DISTORSIÓN ACTIVA" : "LÚCIDO"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white font-['Outfit']">
            {riskPercentage}%
          </div>
          <div className="text-[var(--wadi-text-muted)] text-[10px] uppercase tracking-widest mt-1">
            NIVEL DE AUTOENGAÑO
          </div>
        </div>
      </div>

      {/* VULNERABILITIES LIST */}
      <div className="w-full max-w-2xl space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {vulnerabilities.length === 0 ? (
          <div className="text-center py-12 text-[var(--wadi-text-muted)] font-mono-wadi border border-dashed border-[var(--wadi-border)] bg-[var(--wadi-surface)]/20 rounded-sm">
            [TODO CLARO. ESTÁS SIENDO HONESTO CON VOS MISMO.]
          </div>
        ) : (
          vulnerabilities.map((vuln, idx) => (
            <div
              key={idx}
              className={`
                        border-l-2 p-6 bg-[var(--wadi-surface)]/30 relative overflow-hidden group rounded-r-sm hover:bg-[var(--wadi-surface)]/50 transition-colors
                        ${vuln.level === "HIGH" ? "border-[var(--wadi-alert)]" : "border-[var(--wadi-primary)]"}
                    `}
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`
                            font-mono-wadi text-[10px] px-2 py-0.5 font-bold tracking-wider uppercase
                            ${vuln.level === "HIGH" ? "text-[var(--wadi-alert)] bg-[var(--wadi-alert)]/10" : "text-[var(--wadi-primary)] bg-[var(--wadi-primary)]/10"}
                        `}
                >
                  {vuln.level === "HIGH" ? "ZONA CIEGA CRÍTICA" : "DISTORSIÓN"}
                </span>
              </div>
              <h3 className="font-['Outfit'] text-lg font-medium text-white mb-2">
                {vuln.title}
              </h3>
              <p className="text-[var(--wadi-text-muted)] text-sm font-light leading-relaxed">
                {vuln.description}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ACTIONS */}
      <div className="w-full max-w-2xl mt-8 flex justify-end gap-4">
        <Button
          className="border border-[var(--wadi-text-muted)] text-[var(--wadi-text-muted)] hover:text-white"
          onClick={() => navigate(-1)}
        >
          [CERRAR MAPA]
        </Button>
      </div>
    </div>
  );
}
