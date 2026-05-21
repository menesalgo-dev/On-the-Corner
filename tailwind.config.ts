import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        otc: {
          bg: '#080808',
          surface: '#0d0d0d',
          'surface-2': '#141414',
          line: '#1f1f1f',
          accent: '#e8c800',
          'accent-2': '#ffe25a',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        display: ['var(--font-archivo-black)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(232,200,0,0.35)',
        'glow-lg': '0 0 48px rgba(232,200,0,0.55)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 rgba(232,200,0,0)' },
          '50%': { boxShadow: '0 0 24px rgba(232,200,0,0.55)' },
        },
        'pulse-dot': {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.4', transform: 'scale(.8)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
