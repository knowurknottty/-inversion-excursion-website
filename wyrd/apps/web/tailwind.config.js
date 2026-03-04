/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        'wyrd': {
          900: '#1a1a2e',
          800: '#16213e',
          700: '#0f3460',
          600: '#e94560',
          500: '#ff6b6b',
          400: '#ffd93d',
          300: '#6bcb77',
          100: '#f5f5f5',
        }
      }
    },
  },
  plugins: [],
}
