/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#eef1f7',
          100: '#d7deec',
          200: '#aebcd9',
          300: '#8497bf',
          400: '#5b719f',
          500: '#3d4f79',
          600: '#2a3a5c',
          700: '#1c2942',
          800: '#131d30',
          900: '#0c1220',
        },
        brass: {
          50: '#fbf6ea',
          100: '#f3e6c2',
          200: '#e8d094',
          300: '#dcb965',
          400: '#cda23f',
          500: '#b4872a',
          600: '#8f6a21',
          700: '#6b4f19',
        },
        paper: {
          DEFAULT: '#f6f3ec',
          dim: '#ece7d9',
        },
        moss: {
          500: '#3f6b52',
          600: '#325745',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        seal: '0 1px 2px rgba(12,18,32,0.06), 0 8px 24px -8px rgba(12,18,32,0.18)',
      },
    },
  },
  plugins: [],
};