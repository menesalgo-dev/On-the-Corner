/**
 * next.config.ts
 *
 * Note importanti:
 *  - `remotePatterns` permette di ottimizzare immagini dai domini dei feed RSS.
 *    In alternativa puoi usare `unoptimized` su <Image> (vedi NewsCard.tsx).
 *  - Le redirect 301 servono per la migrazione SEO da Hostinger
 *    (aggiorna i path con quelli reali del vecchio sito).
 */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Italiane
      { protocol: 'https', hostname: '**.gazzetta.it' },
      { protocol: 'https', hostname: '**.corrieredellosport.it' },
      { protocol: 'https', hostname: '**.sky.it' },
      { protocol: 'https', hostname: '**.skysports.com' },
      { protocol: 'https', hostname: '**.eurosport.it' },
      { protocol: 'https', hostname: '**.tuttosport.com' },
      { protocol: 'https', hostname: '**.repubblica.it' },
      { protocol: 'https', hostname: '**.sportmediaset.mediaset.it' },
      { protocol: 'https', hostname: '**.mediaset.it' },
      { protocol: 'https', hostname: '**.ansa.it' },
      { protocol: 'https', hostname: '**.calciomercato.com' },
      { protocol: 'https', hostname: '**.formulapassion.it' },
      // Estere
      { protocol: 'https', hostname: '**.bbci.co.uk' },
      { protocol: 'https', hostname: '**.bbc.co.uk' },
      { protocol: 'https', hostname: '**.formula1.com' },
      { protocol: 'https', hostname: '**.marca.com' },
      { protocol: 'https', hostname: '**.uecdn.es' },
      { protocol: 'https', hostname: '**.as.com' },
      { protocol: 'https', hostname: '**.epimg.net' },
      { protocol: 'https', hostname: '**.uefa.com' },
      { protocol: 'https', hostname: '**.atptour.com' },
      // Avatar Supabase / Google
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async redirects() {
    return [
      // Migrazione da Hostinger — sostituisci con i tuoi vecchi path
      // { source: '/news/calcio', destination: '/news?sport=calcio', permanent: true },
      // { source: '/partite-oggi', destination: '/live', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
