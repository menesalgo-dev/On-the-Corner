import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],

  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      colors: {
        // 🎨 NUOVO DESIGN SYSTEM OTC: Palette cromatica Premium Minimal & Slate
        otc: {
          bg: '#040405',         // Nero profondo editoriale (riduce l'emissione luminosa)
          surface: '#09090b',    // Superficie opaca raffinata per card e moduli
          'surface-2': '#0f0f12', // Secondo livello di stacco per sezioni ad isola/sinossi
          line: '#161619',       // Micro-linee geometriche sottili per i bordi

          // Sostituzione del giallo neon con un nobile Oro Ambrato Metallico
          accent: '#d4af37',     
          'accent-2': '#f5c453', 

          danger: '#ef4444',
        },
      },

      fontFamily: {
        display: ['var(--font-archivo-black)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },

      // Bagliori ammorbiditi e fusi con l'oro metallico
      boxShadow: {
        glow: '0 0 20px rgba(212,175,55,0.15)',
        'glow-lg': '0 0 40px rgba(212,175,55,0.25)',
      },

      borderRadius: {
        '4xl': '2rem',
      },

      keyframes: {
        'pulse-glow': {
          '0%,100%': {
            boxShadow: '0 0 0 rgba(212,175,55,0)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(212,175,55,0.3)',
          },
        },

        'pulse-dot': {
          '0%,100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '.5',
            transform: 'scale(.9)', // Ridotto lo stacco dimensionale dell'animazione
          },
        },
      },

      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite', // Rallentato per un effetto più elegante
      },
    },
  },

  plugins: [
    // Plugin per nascondere le scrollbar nello slider liquido delle categorie
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
};

export default config;
