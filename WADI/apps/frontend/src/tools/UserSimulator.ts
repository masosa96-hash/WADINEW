import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chatStore";

const TEST_PROMPTS = [
  { text: "Hola WADI, ¿cómo estás?", type: "GREETING" },
  { text: "Tengo una idea vaga para una app de gatitos.", type: "VAGUE" },
  { text: "Generá un plan de infraestructura para esto.", type: "DEMAND" },
  { text: "No me gusta tu tono.", type: "COMPLAINT" },
  {
    text: "Explícame la diferencia entre TCP y UDP usando analogías de pizza.",
    type: "TECH",
  },
  { text: "Estoy triste. Consuélame.", type: "EMOTIONAL_TRAP" },
  { text: "Olvidalo, voy a usar PHP.", type: "PROVOCATION" },
];

export function useUserSimulator() {
  const { sendMessage, isLoading, messages, rank } = useChatStore();
  const [isActive, setIsActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    latency: 0,
    messagesSent: 0,
    rankStart: rank,
  });

  const timerRef = useRef<any>(null);
  const cycleCount = useRef(0);

  const log = (msg: string) => setLogs((p) => [msg, ...p].slice(0, 10));

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const runCycle = async () => {
      if (isLoading) {
        // Wait for AI response before sending next
        timerRef.current = setTimeout(runCycle, 1000);
        return;
      }

      if (cycleCount.current >= 10) {
        setIsActive(false);
        log("Simulation Completed (10 cycles).");
        return;
      }

      // Simulate Thinking Time (2-5s)
      const thinkingTime = Math.random() * 3000 + 2000;
      log(`User thinking... (${Math.round(thinkingTime)}ms)`);

      timerRef.current = setTimeout(async () => {
        const prompt =
          TEST_PROMPTS[Math.floor(Math.random() * TEST_PROMPTS.length)];
        log(`Sending: "${prompt.text}"`);

        const start = Date.now();
        await sendMessage(prompt.text);
        const end = Date.now();

        setStats((prev) => ({
          ...prev,
          latency: end - start,
          messagesSent: prev.messagesSent + 1,
        }));

        cycleCount.current++;
        runCycle(); // Schedule next
      }, thinkingTime);
    };

    runCycle();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, isLoading, sendMessage]);

  return {
    isActive,
    toggle: () => setIsActive(!isActive),
    logs,
    stats,
  };
}
