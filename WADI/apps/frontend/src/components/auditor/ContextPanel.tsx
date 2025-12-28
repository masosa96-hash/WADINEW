import { useChatStore } from "../../store/chatStore";
import { Target, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

export function ContextPanel() {
  const { messages, activeFocus, rank, points } = useChatStore();

  // Extract diagnoses from messages
  const diagnoses = useMemo(() => {
    return messages
      .filter((m) => m.diagnosis)
      .map((m) => ({
        id: m.id,
        parsed: m.diagnosis?.replace(/_/g, " "),
        timestamp: m.created_at,
      }))
      .reverse(); // Newest first
  }, [messages]);

  /*
  // Future V2: Extract implied commitments
  const commitments = useMemo(() => {
    // ...
  }, [activeFocus]);
  */

  return (
    <div className="flex flex-col h-full p-6 gap-8 bg-zinc-50/50">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900 uppercase">
          Tablero de Control
        </h2>
        <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
          FACT SHEET & METRICS
        </span>
      </div>

      {/* 1. ACTIVE FOCUS CARD */}
      <div
        className={`p-4 bg-white rounded-2xl shadow-sm border relative overflow-hidden group transition-colors duration-500 ${activeFocus ? "border-amber-400/30" : "border-zinc-200/60"}`}
      >
        <div
          className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${activeFocus ? "bg-amber-500" : "bg-zinc-300"}`}
        ></div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-zinc-600">
            <Target
              size={14}
              className={
                activeFocus ? "text-amber-600 animate-pulse" : "text-zinc-400"
              }
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${activeFocus ? "text-amber-700" : "text-zinc-400"}`}
            >
              {activeFocus ? "Foco Pendiente" : "Sin Objetivo"}
            </span>
          </div>
          {activeFocus && (
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-[pulse_3s_infinite]" />
          )}
        </div>
        <p className="text-sm font-medium text-zinc-800 leading-snug">
          {activeFocus || "El sistema espera una declaración de intención."}
        </p>
      </div>

      {/* 2. DIAGNOSIS LOG */}
      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex items-center justify-between text-zinc-500">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Historial Clínico
            </span>
          </div>
          <span className="text-[10px] bg-zinc-200 px-1.5 py-0.5 rounded-full">
            {diagnoses.length}
          </span>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-2 -mr-2">
          {diagnoses.length === 0 ? (
            <div className="p-4 border border-dashed border-zinc-200 rounded-xl text-center">
              <span className="text-xs text-zinc-400">
                Sin anomalías detectadas.
              </span>
            </div>
          ) : (
            diagnoses.map((diag) => (
              <div
                key={diag.id}
                className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-700 uppercase">
                    {diag.parsed}
                  </span>
                  <span className="text-[9px] text-red-400 opacity-60">
                    {diag.timestamp
                      ? new Date(diag.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. METRICS FOOTER */}
      <div className="mt-auto pt-6 border-t border-zinc-200 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-medium">Eficiencia</span>
          <span className="text-sm font-bold font-mono text-zinc-900">
            {points} PTS
          </span>
        </div>
        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
          {/* Visual progress bar based on points (clamped 0-1000) */}
          <div
            className="h-full bg-zinc-800 transition-all duration-500"
            style={{
              width: `${Math.min(Math.max((points / 1000) * 100, 5), 100)}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest justify-center">
          <span>Rango: {rank.replace(/_/g, " ")}</span>
        </div>
      </div>
    </div>
  );
}
