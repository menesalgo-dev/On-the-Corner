/**
 * app/news/[id]/page.tsx
 * Dettaglio singola notizia identificata tramite hash univoco.
 * Mostra immagine grande + Box Sinossi Editoriale + pulsante link esterno originale.
 */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { BookmarkButton } from '@/components/news/BookmarkButton';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchNewsByHash, fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';
import { formatRelative } from '@/lib/utils';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 600;

interface PageProps { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: PageProps) {
  const { id: hash } = await params;
  const rawNews = await fetchNewsByHash(hash);
  if (!rawNews) return { title: 'Notizia non trovata' };
  const news = toNewsCardData(rawNews);
  return { title: news.title, description: news.description ?? undefined };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id: hash } = await params;
  const rawNews = await fetchNewsByHash(hash);
  if (!rawNews) notFound();

  const news = toNewsCardData(rawNews);
  const [bookmarkHashes, relatedRows] = await Promise.all([
    fetchUserBookmarkHashes(),
    fetchLatestNews({ limit: 6 }),
  ]);

  const isBookmarked = bookmarkHashes.has(news.id);
  const otherNews = (relatedRows || [])
    .map((row: any) => toNewsCardData(row))
    .filter((n) => n.id !== news.id)
    .slice(0, 5);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12 bg-[#080808]">
        <Link href="/news" className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Indietro
        </Link>

        <article className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e8c800] px-2 py-0.5 text-[10px] uppercase tracking-widest text-black font-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              {news.source_name}
            </span>
            {news.category_name && (
              <span className="rounded-md border border-[#e8c800]/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#e8c800] font-medium">
                {news.category_emoji} {news.category_name}
              </span>
            )}
            <span className="text-[11px] uppercase tracking-wider text-zinc-400 ml-auto sm:ml-0" style={{ fontFamily: 'var(--font-dm-mono)' }} suppressHydrationWarning>
              {formatRelative(news.published_at)}
            </span>
          </div>

          <h1 className="text-2xl uppercase leading-tight tracking-tight text-white sm:text-4xl font-black mb-6" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            {news.title}
          </h1>

          {news.image_url && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#141414]">
              <Image
                src={news.image_url}
                alt=""
                fill
                sizes="(min-width: 768px) 800px, 100vw"
                className="object-cover"
                unoptimized
                priority
              />
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-zinc-900 bg-[#080808] p-5 md:p-6">
            <div className="flex items-center gap-2 mb-3 text-[#e8c800] text-xs font-mono uppercase tracking-wider">
              <FileText className="h-4 w-4" />
              Sinossi Articolo
            </div>
            {news.description ? (
              <p className="text-zinc-300 text-sm leading-relaxed sm:text-base">
                {news.description}
              </p>
            ) : (
              <p className="text-zinc-500 text-sm italic">
                Nessun riassunto testuale disponibile per questo feed. Clicca sul pulsante sottostante per consultare il report completo.
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[#1f1f1f] pt-6">
            <Link href={news.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#e8c800] px-5 py-3 text-sm uppercase tracking-wider text-black font-black transition hover:scale-[1.02]" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              Leggi l&apos;articolo su {news.source_name} <ExternalLink className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 ml-sm-auto">
              <BookmarkButton newsHash={news.id} initialBookmarked={isBookmarked} />
              <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
                {isBookmarked ? 'Salvata nei preferiti' : 'Salva per dopo'}
              </span>
            </div>
          </div>
        </article>

        {otherNews.length > 0 && (
          <section className="mt-12 border-t border-zinc-900 pt-8">
            <h2 className="mb-6 text-base uppercase tracking-tight text-white sm:text-xl font-black" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              Continua a <span className="text-[#e8c800]">leggere</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherNews.map((n) => (
                <NewsCard key={n.id} news={n} isBookmarked={bookmarkHashes.has(n.id)} variant="compact" />
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
