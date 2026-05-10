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
         app: {
           canvas: '#f1f5f9',
           surface: '#ffffff',
           accent: '#4f46e5',
           'accent-hover': '#4338ca',
           'accent-soft': '#eef2ff',
           'accent-glow': 'rgba(79,70,229,0.15)',
           navy: '#0f172a',
           'navy-mid': '#1e293b',
           muted: '#94a3b8',
           border: '#e2e8f0',
         },
          premium: {
            canvas: '#f1f5f9',
            mist: '#f8fafc',
            orange: '#4f46e5',
            'orange-hover': '#4338ca',
            'orange-soft': '#eef2ff',
            navy: '#0f172a',
            'navy-mid': '#1e293b',
            teal: '#818cf8',
            'teal-deep': '#6366f1',
          },
          blink: {
            yellow: '#e5ff47',
            dark: '#0a0a0a',
            card: '#111111',
          },
        },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        card: '0 4px 20px -6px rgba(15,23,42,0.08), 0 2px 8px -4px rgba(15,23,42,0.04)',
        'card-hover': '0 8px 32px -8px rgba(15,23,42,0.12), 0 4px 16px -6px rgba(15,23,42,0.06)',
        btn: '0 4px 14px -4px rgba(79,70,229,0.4)',
        'btn-hover': '0 6px 20px -6px rgba(79,70,229,0.5)',
        premium: '0 4px 20px -6px rgba(15,23,42,0.08), 0 2px 8px -4px rgba(15,23,42,0.04)',
        'premium-sm': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'premium-btn': '0 4px 14px -4px rgba(79,70,229,0.4)',
        'premium-inset': 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
