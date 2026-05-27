/**
 * next.config.mjs
 *
 * Configurazione unificata per Next.js.
 * Supporta l'App Router, ottimizza le prestazioni dei pacchetti esterni 
 * e abilita il caricamento di immagini remote universali tramite pattern jolly.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Ottimizzazione automatica dei pacchetti per ridurre i tempi di compilazione e bundle
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'framer-motion'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    // Configurazione dei domini per l'ottimizzazione e lo streaming multimediale
    remotePatterns: [
      // PATTERN UNIVERSALE JOLLY: Abilita e sblocca il caricamento di immagini da qualsiasi server CDN esterno
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      // Configurazione dei domini espliciti ereditati per retrocompatibilità SEO e CDN
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
      { protocol: 'https', hostname: '**.bbci.co.uk' },
      { protocol: 'https', hostname: '**.bbc.co.uk' },
      { protocol: 'https', hostname: '**.formula1.com' },
      { protocol: 'https', hostname: '**.marca.com' },
      { protocol: 'https', hostname: '**.uecdn.es' },
      { protocol: 'https', hostname: '**.as.com' },
      { protocol: 'https', hostname: '**.epimg.net' },
      { protocol: 'https', hostname: '**.uefa.com' },
      { protocol: 'https', hostname: '**.atptour.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Gestione dei reindirizzamenti permanenti e migrazioni SEO
  async redirects() {
    return [
      // Inserire qui eventuali vecchi percorsi per la migrazione da Hostinger
      // { source: '/news/calcio', destination: '/news?source=g', permanent: true },
    ];
  },

  // Intestazioni HTTP di sicurezza e protezione dagli attacchi di iniezione (Clickjacking, MIME-sniffing)
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
