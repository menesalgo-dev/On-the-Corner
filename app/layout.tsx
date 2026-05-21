import { Archivo_Black, Inter, DM_Mono } from 'next/font/google';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-archivo-black',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${archivoBlack.variable} ${inter.variable} ${dmMono.variable}`}>
      <body className="bg-[#080808] text-white font-sans antialiased min-h-dvh">
        {children}
      </body>
    </html>
  );
}
