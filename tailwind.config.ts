/**
 * tailwind.config.ts
 * Tema On The Corner — Tailwind v4 (con @theme inline). Per Tailwind v3
 * usa la sezione `theme.extend` qui sotto.
 *
 * Colori:
 *   bg:     #080808 (nero profondo)
 *   accent: #e8c800 (giallo vibrante)
 */
import type { Config } from 'tailwindcss';

export default {
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
          bg:         '#080808',
          surface:    '#0d0d0d',
          'surface-2':'#141414',
          line:       '#1f1f1f',
          accent:     '#e8c800',
          'accent-2': '#ffe25a',
          danger:     '#ef4444',
          win:        '#e8c800',
        },
      },
      fontFamily: {
        display: ['var(--font-archivo-black)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)',        'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)',      'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow:     '0 0 24px rgba(232,200,0,0.35)',
        'glow-lg':'0 0 48px rgba(232,200,0,0.55)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'pulse-glow': {
          '0%,100%': { boxShadow: '0 0 0 rgba(232,200,0,0)' },
          '50%':     { boxShadow: '0 0 24px rgba(232,200,0,0.55)' },
        },
        'flag-wave': {
          '0%,100%': { transform: 'skewX(0deg)' },
          '50%':     { transform: 'skewX(-6deg)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        'flag-wave':  'flag-wave 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
