/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // Deep midnight blue
        surface: "rgba(30, 41, 59, 0.7)", // Glassy surface
        primary: "#3b82f6", // Electric blue
        accent: "#f472b6", // Neo-pink
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
