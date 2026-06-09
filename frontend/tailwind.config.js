/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Dark theme
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          hover: '#1a1a2e',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        neon: {
          purple: '#7c3aed',
          gold: '#f59e0b',
          pink: '#ec4899',
        },
        // Light theme
        light: {
          bg: '#fafafa',
          card: '#ffffff',
          border: '#e5e7eb',
        },
        lavender: {
          100: '#f3f0ff',
          200: '#e9e3ff',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        skyblue: {
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        softpink: {
          100: '#fce7f3',
          400: '#f472b6',
          500: '#ec4899',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          to: { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6)' },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
        'card-dark': '0 4px 24px rgba(0,0,0,0.4)',
        'card-light': '0 4px 24px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
