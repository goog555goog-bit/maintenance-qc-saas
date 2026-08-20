/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          900: 'var(--primary-900)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
        },
        border: 'var(--border)',
        text: {
          DEFAULT: 'var(--text-main)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

