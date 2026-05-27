/**
 * app/news/[id]/page.tsx
 * Dettaglio singola notizia identificata tramite hash univoco.
 * Mostra immagine grande + descrizione + pulsante link esterno originale.
 */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { BookmarkButton } from '@/components/news/BookmarkButton';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchNewsByHash, fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';
import { formatRelative } from '@/lib/utils';
import { toFrontendItem } from '@/lib/news/types';

// Rigenerazione incrementale (ISR) mantenuta a 10 minuti come da blueprint
export const revalidate = 600;

interface PageProps {
  params: Promise<{ id: string }>; // Il parametro cartella [id] rappresenta l'hash SHA-1 della notizia
}

export async function generateMetadata({ params }: PageProps) {
  const { id: hash } = await params;
  const rawNews = await fetchNewsByHash(hash);
  if (!rawNews) return { title: 'Notizia non trovata' };
  
  const news = toFrontendItem(rawNews);
  return {
    title: news.title,
    description: news.description ?? undefined,
    openGraph: {
      title: news.title,
      description: news.description ?? undefined,
      images: news.imageUrl ? [news.imageUrl] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id: hash } = await params;
  
  // Recupero della notizia singola tramite hash logico
  const rawNews = await fetchNewsByHash(hash);
  if (!rawNews) notFound();

  // Normalizzazione immediata del record DB nel formato CamelCase tipizzato
  const news = toFrontendItem(rawNews);

  // Caricamento parallelo dei segnalibri (basati su hash) e delle notizie correlate
  const [bookmarkHashes, relatedRows] = await Promise.all([
    fetchUserBookmarkHashes(),
    fetchLatestNews({ limit: 6 }),
  ]);

  const isBookmarked = bookmarkHashes.has(news.hash);
  
  // Conversione e filtraggio delle notizie correlate escludendo quella attuale
  const otherNews = (relatedRows || [])
    .map((row: any) => toFrontendItem(row))
    .filter((n) => n.hash !== news.hash)
    .slice(0, 5);

  // Mappatura statica delle icone/nomi sport per sopperire alla rimozione della vista
  const categoryMeta: Record<number, { name: string; emoji: string }> = {
    1: { name: 'Calcio', emoji: '⚽' },
    2: { name: 'F1', emoji: '🏎️' },
    3: { name: 'Tennis', emoji: '🎾' },
    4: { name: 'MotoGP', emoji: '🏍️' }
  };
  const currentCategory = categoryMeta[news.categoryId as number];

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12 bg-[#080808]">
        {/* Pulsante Indietro */}
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Indietro
        </Link>

        <article className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 sm:p-8">
          {/* Metadati dell'articolo */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md bg-[#e8c800] px-2 py-0.5 text-[10px] uppercase tracking-widest text-black font-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {news.sourceName}
            </span>
            
            {currentCategory && (
              <span className="rounded-md border border-[#e8c800]/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#e8c800] font-medium">
                {currentCategory.emoji} {currentCategory.name}
              </span>
            )}

            <span
              className="text-[11px] uppercase tracking-wider text-zinc-400 ml-auto sm:ml-0"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
              suppressHydrationWarning
            >
              {formatRelative(news.publishedAt)}
            </span>
          </div>

          {/* Titolo */}
          <h1
            className="text-2xl uppercase leading-tight tracking-tight text-white sm:text-4xl font-black"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {news.title}
          </h1>

          {/* Immagine Copertina */}
          {news.imageUrl && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800">
              <Image
                src={news.imageUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 800px, 100vw"
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}

          {/* Corpo del testo / Descrizione */}
          {news.description && (
            <p className="mt-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {news.description}
            </p>
          )}

          {/* Barra delle Azioni Inferiore */}
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#1f1f1f] pt-6">
            <Link
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e8c800] px-5 py-3 text-sm uppercase tracking-wider text-black font-black transition hover:scale-[1.02]"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Leggi su {news.sourceName}
              <ExternalLink className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-2 ml-sm-auto">
              <BookmarkButton newsHash={news.hash} initialBookmarked={isBookmarked} />
              <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                {isBookmarked ? 'Salvata nei preferiti' : 'Salva per dopo'}
              </span>
            </div>
          </div>
        </article>

        {/* Sezione Notizie Correlate */}
        {otherNews.length > 0 && (
          <section className="mt-12 border-t border-zinc-900 pt-8">
            <h2
              className="mb-6 text-base uppercase tracking-tight text-white sm:text-xl font-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Continua a <span className="text-[#e8c800]">leggere</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherNews.map((n) => (
                <NewsCard 
                  key={n.hash} 
                  news={n} 
                  isBookmarked={bookmarkHashes.has(n.hash)} 
                  variant="compact" 
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
