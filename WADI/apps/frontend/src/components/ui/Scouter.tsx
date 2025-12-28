import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chatStore";
import { useScouter } from "../../hooks/useScouter";

interface ScouterProps {
  isDecisionBlocked?: boolean;
}

export function Scouter({ isDecisionBlocked = false }: ScouterProps) {
  const messages = useChatStore((state) => state.messages);
  const rank = useChatStore((state) => state.rank);
  const systemDeath = useChatStore((state) => state.systemDeath);
  const resetChat = useChatStore((state) => state.resetChat);
  const navigate = useNavigate();

  const {
    playAlertSound,
    playScanSound,
    initAmbientHum,
    setAmbientIntensity,
    playDeathSound,
    playYawnSound,
  } = useScouter();
  const prevMessagesLength = useRef(messages.length);
  const prevRank = useRef(rank);

  const visualAlertTimestamp = useChatStore(
    (state) => state.visualAlertTimestamp
  );
  const prevVisualAlertTimestamp = useRef(visualAlertTimestamp);

  // Trigger Visual Alert on Timestamp Change
  useEffect(() => {
    if (visualAlertTimestamp !== prevVisualAlertTimestamp.current) {
      playAlertSound();
      const flashOverlay = document.getElementById("scouter-flash-overlay");
      if (flashOverlay) {
        // Alerta roja explícita para errores de validación
        flashOverlay.style.background = "var(--wadi-alert)";
        setTimeout(() => {
          flashOverlay.style.opacity = "0.6";
        }, 100);
        setTimeout(() => {
          flashOverlay.style.opacity = "0";
        }, 800);
      }
      prevVisualAlertTimestamp.current = visualAlertTimestamp;
    }
  }, [visualAlertTimestamp, playAlertSound]);

  const scornTimestamp = useChatStore((state) => state.scornTimestamp);
  const prevScornTimestamp = useRef(scornTimestamp);

  // Trigger Scorn Alert (Lavender Flash + Yawn Sound)
  useEffect(() => {
    if (scornTimestamp !== prevScornTimestamp.current) {
      playYawnSound(); // Electronic Yawn
      const flashOverlay = document.getElementById("scouter-flash-overlay");
      if (flashOverlay) {
        flashOverlay.style.background = "#A78BFA"; // Lavender
        setTimeout(() => {
          flashOverlay.style.opacity = "0.5";
        }, 100);
        setTimeout(() => {
          flashOverlay.style.opacity = "0";
        }, 800);
      }
      prevScornTimestamp.current = scornTimestamp;
    }
  }, [scornTimestamp, playYawnSound]);

  // Initialize Ambient Hum on Mount
  useEffect(() => {
    const handleInteraction = () => initAmbientHum();
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [initAmbientHum]);

  useEffect(() => {
    if (systemDeath) {
      setAmbientIntensity("high");
      return;
    }
    // Si hay check de lucidez, el ambiente sube pero no es hostil
    setAmbientIntensity(isDecisionBlocked ? "high" : "normal");
  }, [isDecisionBlocked, systemDeath, setAmbientIntensity]);

  // System Death Logic (Keep as fail-safe)
  useEffect(() => {
    if (systemDeath) {
      playDeathSound();
      const overlay = document.getElementById("scouter-flash-overlay");
      let active = true;
      const loop = () => {
        if (!active || !overlay) return;
        overlay.style.opacity = Math.random() > 0.5 ? "0.8" : "0.2";
        setTimeout(loop, 100);
      };
      loop();

      const timer = setTimeout(() => {
        resetChat();
        useChatStore.setState({
          systemDeath: false,
          rank: "GENERADOR_DE_HUMO",
          points: 0,
        });
        navigate("/");
      }, 10000);

      return () => {
        active = false;
        clearTimeout(timer);
        if (overlay) overlay.style.opacity = "0";
      };
    }
  }, [systemDeath, navigate, resetChat, playDeathSound]);

  // Rank Change Logic (Visual pulse)
  useEffect(() => {
    if (prevRank.current !== rank) {
      playScanSound();
      const overlay = document.getElementById("scouter-flash-overlay");
      if (overlay) {
        overlay.style.backgroundColor = "var(--wadi-primary)";
        overlay.style.opacity = "0.3"; // Más suave
        setTimeout(() => {
          overlay.style.opacity = "0";
          overlay.style.backgroundColor = "var(--wadi-alert)";
        }, 1500);
      }
    }
    prevRank.current = rank;
  }, [rank, playScanSound]);

  useEffect(() => {
    const newCount = messages.length;
    const oldCount = prevMessagesLength.current;

    if (newCount > oldCount) {
      const lastMsg = messages[newCount - 1];
      const isMyMessage = lastMsg.role === "user";

      // SCOUTER LOGIC
      if (!isMyMessage) {
        const text = lastMsg.content || "";
        const isChaotic = text.includes("[ALERTA DE CAOS DETECTADA]");
        const isLucidityCheck =
          text.includes("[CHECK_DE_LUCIDEZ]") ||
          text.includes("[FORCE_DECISION]"); // Backwards compat
        const isAnalysis =
          text.includes("Analizar") || text.includes("[DECONSTRUCT_START]");

        if (isChaotic || isLucidityCheck) {
          playAlertSound();
          const flashOverlay = document.getElementById("scouter-flash-overlay");
          if (flashOverlay) {
            // Si es Lucidez, color lavanda suave, no rojo
            if (isLucidityCheck) {
              flashOverlay.style.background = "var(--wadi-primary)";
            } else {
              flashOverlay.style.background = "var(--wadi-alert)";
            }
            setTimeout(() => {
              flashOverlay.style.opacity = "0.4";
            }, 100);
            setTimeout(() => {
              flashOverlay.style.opacity = "0";
              flashOverlay.style.background = "var(--wadi-alert)"; // reset
            }, 1000);
          }
        } else if (isAnalysis) {
          playScanSound();
        }
      }
    }
    prevMessagesLength.current = newCount;
  }, [messages, playAlertSound, playScanSound]);

  return (
    <>
      <div
        id="scouter-flash-overlay"
        className="fixed inset-0 pointer-events-none z-[9999] bg-[var(--wadi-alert)] opacity-0 transition-opacity duration-1000 mix-blend-screen" // blend screen is softer
        aria-hidden="true"
      />

      {systemDeath && (
        <div className="fixed inset-0 z-[10000] pointer-events-auto bg-black/80 flex items-center justify-center overflow-hidden">
          <div className="text-[var(--wadi-alert)] font-bold text-4xl animate-pulse font-mono-wadi tracking-widest text-center">
            DESCONEXIÓN VITAL
            <br />
            PROTOCOL_RESET
            <br />
            <span className="text-sm text-white mt-4 block">
              Reiniciando búnker...
            </span>
          </div>
        </div>
      )}
    </>
  );
}
