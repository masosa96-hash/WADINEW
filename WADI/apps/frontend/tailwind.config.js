/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Bunker Theme
        wadi: {
          base: "#0B0F14",    // Background base
          surface: "#121821", // Surface
          border: "#1E2633",  // Sutil border
          text: "#E6EDF3",    // Primary text
          muted: "#9AA4B2",   // Secondary text
          accent: "#2ECC71",  // Technical Green (or #3B82F6 Blue)
          error: "#991B1B",   // Muted Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
