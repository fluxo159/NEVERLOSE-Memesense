/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#38abf8',
          500: '#0e91e6',
          600: '#0274c4',
          700: '#035ca0',
          800: '#074e84',
          900: '#0c416e',
          950: '#082a4a',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        uzb: {
          blue: '#0099B5',
          green: '#1EB53A',
          red: '#CE1126',
          dark: '#0B192C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
