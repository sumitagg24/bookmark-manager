/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        premium: {
          canvas: '#dbeaf0',
          mist: '#f4fafc',
          orange: '#ff5c28',
          'orange-hover': '#ff7347',
          'orange-soft': '#fff0eb',
          navy: '#142239',
          'navy-mid': '#1e3354',
          teal: '#7dd3e8',
          'teal-deep': '#5ab8d0',
        },
      },
      boxShadow: {
        premium:
          '0 12px 48px -12px rgba(20, 34, 57, 0.14), 0 4px 16px -4px rgba(20, 34, 57, 0.06)',
        'premium-sm':
          '0 6px 28px -8px rgba(20, 34, 57, 0.1), 0 2px 8px -2px rgba(20, 34, 57, 0.05)',
        'premium-btn':
          '0 10px 32px -8px rgba(255, 92, 40, 0.5), 0 4px 12px -4px rgba(255, 92, 40, 0.25)',
        'premium-inset': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
