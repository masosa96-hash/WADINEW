export const WadiTheme = {
  colors: {
    background: "var(--wadi-bg-solid)",
    primary: "var(--wadi-primary)",
    accent: "var(--wadi-accent)",
    text: "var(--wadi-text)",
    textSecondary: "var(--wadi-text-secondary)",
    border: "var(--wadi-border)",
    surface: "var(--wadi-surface)",
  },
  gradients: {
    // Definición centralizada de los gradientes WADI
    logo: "bg-gradient-to-tr from-[var(--wadi-primary)] to-[var(--wadi-accent)]",
    background: "bg-[image:var(--wadi-bg)]",
  },
  effects: {
    // Glassmorphism y sombras
    glass:
      "backdrop-blur-xl bg-[var(--wadi-surface)] border border-[var(--wadi-border)]",
    glassHeavy:
      "backdrop-blur-2xl bg-[var(--wadi-surface-active)] border border-[var(--wadi-border-hover)]",
    glowMain: "shadow-[0_0_40px_var(--wadi-primary-dim)]",
    pulseSoft: "animate-pulse-soft",
  },
  layout: {
    radius: "rounded-[var(--radius-lg)]",
    radiusFull: "rounded-full",
  },
  typography: {
    mono: "font-mono",
    display: "font-bold tracking-tight",
  },
} as const;
