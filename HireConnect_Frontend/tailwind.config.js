/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#EEF2FF',
          50: '#EEF2FF',
          100: '#E0E7FF',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          light: '#E0F2FE',
        },
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
        },
        bg: {
          DEFAULT: '#F8FAFC',
          dark: '#0B1220',
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        'card-hover': '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.05)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'slide-in-right': { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
