/**
 * next.config.mjs
 *
 * ⚠️ Next 14 NON supporta next.config.ts → usa .mjs.
 * (Il supporto .ts è arrivato in Next 15.)
 *
 * Note:
 *  - `remotePatterns` permette di ottimizzare immagini dai domini dei feed RSS.
 *  - Le redirect 301 servono per la migrazione SEO da Hostinger.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // Migrazione da Hostinger — aggiungi qui i tuoi vecchi path
      // { source: '/news/calcio', destination: '/news?source=g', permanent: true },
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
