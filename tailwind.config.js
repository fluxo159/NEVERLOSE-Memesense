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
        canvas: {
          DEFAULT: '#08090C',
          pure: '#040507',
          lift: '#0B0D12',
        },
        surface: {
          1: '#0E1117',
          2: '#151922',
          3: '#1E2330',
          card: '#12151D',
          hover: '#191E2A',
        },
        hairline: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.16)',
          brand: 'rgba(99, 102, 241, 0.3)',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          linear: '#5E6AD2',
          lavender: '#828FFF',
        },
        gov: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        semantic: {
          success: '#10B981',
          'success-soft': 'rgba(16, 185, 129, 0.15)',
          warning: '#F59E0B',
          'warning-soft': 'rgba(245, 158, 11, 0.15)',
          danger: '#F43F5E',
          'danger-soft': 'rgba(244, 63, 94, 0.15)',
          info: '#06B6D4',
          'info-soft': 'rgba(6, 182, 212, 0.15)',
          purple: '#8B5CF6',
          'purple-soft': 'rgba(139, 92, 246, 0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(99, 102, 241, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.35)',
        'surface-card': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'surface-modal': '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)',
      }
    },
  },
  plugins: [],
}
