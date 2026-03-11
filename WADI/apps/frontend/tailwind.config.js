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
        'wadi-base': '#FAF9F6',
        'wadi-text': '#1A1A1A',
        'wadi-muted': '#6B7280',
        'wadi-border': '#E5E7EB',
        'wadi-gray': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        'wadi-accent': {
          DEFAULT: '#A78BFA',
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
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
