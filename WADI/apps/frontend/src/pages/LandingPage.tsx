import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/chatStore";

export default function LandingPage() {
  const navigate = useNavigate();
  const { resetChat } = useChatStore();

  const handleStart = () => {
    resetChat();
    navigate("/chat");
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden selection:bg-[var(--wadi-primary-dim)]">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--wadi-primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[var(--wadi-accent)] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <main className="wadi-container relative z-10 flex flex-col items-center text-center animate-enter">
        {/* Brand Identity */}
        <div className="mb-8">
          <h1 className="text-display bg-gradient-to-b from-white to-[var(--wadi-text-secondary)] bg-clip-text text-transparent pb-2">
            WADI
          </h1>
        </div>

        {/* Value Proposition */}
        <div className="max-w-2xl space-y-6 mb-12">
          <h2 className="text-2xl md:text-3xl font-light text-[var(--wadi-text)] tracking-tight">
            Del caos al plan
          </h2>
          <p className="text-body mx-auto max-w-[480px]">
            Un espacio de pensamiento ordenado. Sin ruido, sin magia
            innecesaria. Solo vos y una estructura que te entiende.
          </p>
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={handleStart}
            className="wadi-btn wadi-btn-primary group"
            aria-label="Iniciar nueva conversación"
          >
            <span>Empezar ahora</span>
            <svg
              className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        {/* Footer / Trust Signal */}
        <div className="mt-20 opacity-30 text-xs tracking-widest uppercase text-[var(--wadi-text-tertiary)]">
          Sistema Operativo de Mente
        </div>
      </main>
    </div>
  );
}
