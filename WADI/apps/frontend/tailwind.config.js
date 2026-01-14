/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Hybrid Light Theme
        wadi: {
          base: "#FFFFFF",    // Pure White
          surface: "#F9FAFB", // Gray-50 (Sidebar/Panels)
          border: "#E5E7EB",  // Gray-200
          text: "#111827",    // Gray-900
          muted: "#6B7280",   // Gray-500
          accent: "#000000",  // Black (Technical/Premium)
          error: "#EF4444",   // Red-500
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
