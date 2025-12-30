import { useState, useEffect } from "react";

export type WadiMood = "hostile" | "mildly_disappointed" | "training_wheels";

interface WadiOnboardingProps {
  mood?: WadiMood;
}

export default function WadiOnboarding({
  mood = "hostile",
}: WadiOnboardingProps) {
  const [step, setStep] = useState(0);

  const messagesByMood: Record<WadiMood, string[]> = {
    hostile: [
      "*⌛ Cargando paciencia... ERROR 404*",
      "🧠 WADI activo (a regañadientes).",
      "No estoy acá para mimarte,",
      "estoy para que dejes de mentirte.",
      "➡️ Decime qué rompiste hoy,",
      "🌀 o volvé cuando tengas un plan real.",
    ],
    mildly_disappointed: [
      "*⌛ WADI está despertando de su siesta funcional...*",
      "🧠 WADI activo.",
      "Esto puede doler menos si cooperás.",
      "Tomemos una decisión antes de que vuelva la confusión.",
      "📌 ¿Por dónde empezamos?",
      "📉 O seguí divagando, pero sin mí.",
    ],
    training_wheels: [
      "*⌛ Preparando el espacio para ordenar tus ideas...*",
      "🧠 Hola, soy WADI.",
      "Estoy acá para ayudarte a decidir sin drama.",
      "Podemos ir paso a paso, sin presión.",
      "🗺️ Empezamos cuando quieras.",
      "☕ O tomamos un respiro y seguimos después.",
    ],
  };

  const messages = messagesByMood[mood] || messagesByMood.hostile;

  useEffect(() => {
    if (step < messages.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, messages.length]);

  return (
    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] w-[90vw] max-w-lg mx-auto mt-10 text-[var(--color-text-main)] flex flex-col">
      {messages.slice(0, step + 1).map((line, index) => (
        <p
          key={index}
          style={{
            marginBottom: "0.25rem",
            color: index === 0 ? "var(--color-text-soft)" : "inherit",
          }}
        >
          {index === 0 ? (
            <span className="animate-pulse">{line}</span>
          ) : index === 1 ? (
            <strong>{line}</strong>
          ) : (
            line
          )}
        </p>
      ))}
    </div>
  );
}
