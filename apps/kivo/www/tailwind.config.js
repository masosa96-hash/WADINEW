/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "mono-wadi": ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        // Placeholder for WADI colors if needed explicitly,
        // though we are mostly using CSS variables in index.css
      },
    },
  },
  plugins: [],
};
