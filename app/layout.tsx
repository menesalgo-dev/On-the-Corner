/**
 * app/layout.tsx — Root layout di On The Corner.
 * Carica font, header, footer, bottom nav. Tutti i metadata SEO.
 */
import type { Metadata, Viewport } from 'next';
import { Archivo_Black, Inter, DM_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

function safeMetadataBase(): URL | undefined {
  try {
    const raw = process.env.NEXT_PUBLIC_SITE_URL;
    if (!raw) return undefined;
    const url = raw.startsWith('http') ? raw : `https://${raw}`;
    return new URL(url);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: {
    default: 'On The Corner — Sport, schedine e notizie in tempo reale',
    template: '%s · On The Corner',
  },
  description:
    'Notizie sportive da 21 fonti, match live, schedine in tempo reale. Calcio, F1, MotoGP, Tennis, Champions, NFL.',
  keywords: ['calcio', 'serie a', 'formula 1', 'motogp', 'tennis', 'champions league', 'nfl', 'schedine', 'live score', 'notizie sport'],
  authors: [{ name: 'On The Corner' }],
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    siteName: 'On The Corner',
    title: 'On The Corner — Sport, schedine e notizie in tempo reale',
    description: 'Aggregatore sportivo italiano premium.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On The Corner',
    description: 'Sport, schedine e notizie in tempo reale.',
  },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${archivoBlack.variable} ${inter.variable} ${dmMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-[#080808] font-sans text-white antialiased">
        {children}
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#0d0d0d',
              border: '1px solid #1f1f1f',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
