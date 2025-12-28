import React from "react";

export const AuditorHeader: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-[60px] bg-[var(--monday-bg)]/90 backdrop-blur-md border-b border-[var(--monday-border)] z-40 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center border border-[var(--monday-primary)] rounded-full animate-pulse-soft">
          <div className="w-2 h-2 bg-[var(--monday-primary)] rounded-full"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-white font-mono leading-none">
            MONDAY<span className="text-[var(--monday-primary)]">::OS</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-blink block"></span>
            <span className="text-[9px] text-[var(--monday-text-dim)] tracking-widest uppercase font-mono">
              ONLINE // V3.0
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Status */}
      <div className="hidden md:flex gap-4 font-mono text-[10px] text-[var(--monday-text-dim)]">
        <span className="border px-2 py-1 border-[var(--monday-border)] rounded">
          MEM: 64TB
        </span>
        <span className="border px-2 py-1 border-[var(--monday-border)] rounded text-[var(--monday-primary)]">
          UPLINK: SECURE
        </span>
      </div>
    </header>
  );
};
