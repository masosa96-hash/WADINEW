/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wadi-black': '#121212',
        'wadi-card': '#1E1E1E',
        'wadi-gray': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          300: '#D1D5DB',
          500: '#6B7280',
          700: '#374151',
          900: '#111827',
        },
        'wadi-accent': {
          start: '#A78BFA',
          end: '#60A5FA',
        }
      },
      fontFamily: {
        'wadi-mono': ['Roboto Mono', 'monospace'],
        'wadi-sans': ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
