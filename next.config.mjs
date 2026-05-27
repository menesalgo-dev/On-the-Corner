/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Permette il caricamento e lo streaming di immagini da qualsiasi server CDN esterno
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
