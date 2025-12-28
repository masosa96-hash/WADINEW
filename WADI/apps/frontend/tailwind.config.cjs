module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        wadi: {
          bg: "#f3f3f0",
          surface: "#e5e5e0",
          text: "#1a1a1a",
          subtle: "#666666",
          accent: "#00a7a7", // Teal
          danger: "#e11d48", // Stronger red for light mode
          border: "#d4d4cc",
        },
      },
      borderRadius: {
        wadi: "1rem",
      },
      boxShadow: {
        wadi: "0 2px 10px rgba(145, 246, 215, 0.1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      spacing: {
        input: "3rem",
      },
    },
  },
  plugins: [],
};
