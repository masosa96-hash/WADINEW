export const WadiTheme = {
  colors: {
    background: "#0f1115", // var(--wadi-bg-solid)
    backgroundSubtle: "#16181d", // var(--wadi-bg-subtle)
    primary: "#8b5cf6", // var(--wadi-primary)
    primaryDim: "rgba(139, 92, 246, 0.15)", // var(--wadi-primary-dim)
    primaryGlow: "rgba(139, 92, 246, 0.4)", // var(--wadi-primary-glow)
    accent: "#38bdf8", // var(--wadi-accent)
    alert: "#fbbf24", // var(--wadi-alert)
    danger: "#ef4444", // var(--wadi-danger)
    text: "#f1f5f9", // var(--wadi-text)
    textSecondary: "#94a3b8", // var(--wadi-text-secondary)
    textTertiary: "#64748b", // var(--wadi-text-tertiary)
    border: "rgba(255, 255, 255, 0.08)", // var(--wadi-border)
    borderHover: "rgba(255, 255, 255, 0.15)", // var(--wadi-border-hover)
    surface: "rgba(255, 255, 255, 0.03)", // var(--wadi-surface)
    surfaceActive: "rgba(255, 255, 255, 0.06)", // var(--wadi-surface-active)
    surfaceGlass: "rgba(15, 17, 21, 0.6)", // var(--wadi-surface-glass)
  },
  gradients: {
    logo: "bg-gradient-to-tr from-[var(--wadi-primary)] to-[var(--wadi-accent)]",
    background: "bg-[image:var(--wadi-bg)]",
    subtleFade: "bg-gradient-to-b from-transparent to-[var(--wadi-bg-solid)]",
  },
  effects: {
    glass:
      "backdrop-blur-xl bg-[var(--wadi-surface)] border border-[var(--wadi-border)]",
    glassHeavy:
      "backdrop-blur-2xl bg-[var(--wadi-surface-active)] border border-[var(--wadi-border-hover)]",
    glowMain: "shadow-[0_0_40px_var(--wadi-primary-dim)]",
    pulseSoft: "animate-pulse-soft",
    hoverLift: "transition-transform hover:-translate-y-0.5 duration-300",
  },
  layout: {
    radius: "rounded-[24px]", // var(--radius-lg)
    radiusMd: "rounded-[16px]", // var(--radius-md)
    radiusSm: "rounded-[8px]", // var(--radius-sm)
    radiusFull: "rounded-full",
    container: "max-w-7xl mx-auto px-4 md:px-6 w-full",
  },
  typography: {
    fontFamily: '"Outfit", sans-serif',
    mono: "font-mono",
    display: "font-bold tracking-tight",
    body: "text-[1.125rem] leading-relaxed text-[var(--wadi-text-secondary)]",
  },
} as const;
