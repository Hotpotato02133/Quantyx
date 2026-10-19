/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Canvas & Surfaces
        canvas: '#121212',
        surface: '#141414',
        elevated: '#1C1C1E',
        border: '#262626',

        // Financial Semantic Tokens
        profit: '#1DB954',    // Emerald Green — Long / Profit / Positive Edge
        warning: '#FF8C43',   // Warm Amber — Breakeven / Drawdown Alert
        loss: '#EF4444',      // Crimson Red — Short / Loss / Max Drawdown

        // Text hierarchy
        'text-primary': '#F5F5F5',
        'text-secondary': '#A3A3A3',
        'text-muted': '#525252',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'terminal-xs': ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'terminal-sm': ['12px', { lineHeight: '18px', letterSpacing: '0.01em' }],
        'terminal-base': ['13px', { lineHeight: '20px' }],
      },
      backdropBlur: {
        md: '12px',
      },
      borderWidth: {
        hairline: '1px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
