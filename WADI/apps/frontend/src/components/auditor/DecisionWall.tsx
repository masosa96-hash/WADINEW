import React from "react";

interface DecisionWallProps {
  onOptionA: () => void;
  onOptionB: () => void;
}

export const DecisionWall: React.FC<DecisionWallProps> = ({
  onOptionA,
  onOptionB,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg">
      <div className="w-full max-w-md p-1 border-2 border-[var(--monday-amber)] bg-black relative">
        {/* Title Bar */}
        <div className="bg-[var(--monday-amber)] text-black font-bold font-mono px-2 py-1 flex justify-between items-center">
          <span>[CHECK_DE_LUCIDEZ]</span>
          <span className="animate-blink">⚠</span>
        </div>

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          <h2 className="text-2xl font-bold font-mono text-[var(--monday-amber)]">
            DETECTADA DIVAGACIÓN
          </h2>
          <p className="text-[var(--monday-text)] text-sm leading-relaxed">
            El sistema ha detectado una fuga de ejecución. Estás hablando mucho
            y haciendo poco.
            <br />
            <br />
            Seleccioná un protocolo para continuar:
          </p>

          <div className="flex flex-col w-full gap-4 mt-4">
            <button
              onClick={onOptionA}
              className="w-full border border-[var(--monday-primary)] text-[var(--monday-primary)] p-4 hover:bg-[var(--monday-primary)] hover:text-white transition-all text-left font-mono text-sm group"
            >
              <span className="block text-xs opacity-50 mb-1">OPCIÓN A</span>
              <span className="font-bold">VOLVER AL PLAN TÉCNICO</span>
              <span className="block text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Prometo dejar de vender humo y escribir código.
              </span>
            </button>

            <button
              onClick={onOptionB}
              className="w-full border border-[var(--monday-red)] text-[var(--monday-red)] p-4 hover:bg-[var(--monday-red)] hover:text-white transition-all text-left font-mono text-sm group"
            >
              <span className="block text-xs opacity-50 mb-1">OPCIÓN B</span>
              <span className="font-bold">CERRAR CANAL</span>
              <span className="block text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                No estoy listo. Volveré cuando quiera trabajar.
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--monday-amber)]/30 p-2 text-center text-[10px] text-[var(--monday-amber)] font-mono">
          BLOCK_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
        </div>
      </div>
    </div>
  );
};
