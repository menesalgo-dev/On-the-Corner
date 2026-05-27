/**
 * app/news/[id]/page.tsx
 * Dettaglio singola notizia. Mostra immagine grande + descrizione +
 * pulsante "Leggi articolo originale" che apre la fonte in nuovo tab.
 */
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, ArrowLeft, Bookmark } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { BookmarkButton } from '@/components/news/BookmarkButton';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchNewsById, fetchLatestNews, fetchUserBookmarkIds } from '@/lib/news';
import { formatRelative } from '@/lib/utils';

export const revalidate = 600;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const news = await fetchNewsById(id);
  if (!news) return { title: 'Notizia non trovata' };
  return {
    title: news.title,
    description: news.description ?? undefined,
    openGraph: {
      title: news.title,
      description: news.description ?? undefined,
      images: news.image_url ? [news.image_url] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const news = await fetchNewsById(id);
  if (!news) notFound();

  const [bookmarks, related] = await Promise.all([
    fetchUserBookmarkIds(),
    fetchLatestNews({ limit: 6 }),
  ]);

  const isBookmarked = bookmarks.has(news.id);
  const otherNews = related.filter((n) => n.id !== news.id).slice(0, 5);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        {/* Back link */}
        <Link
          href="/news"
          className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Indietro
        </Link>

        <article className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 sm:p-8">
          {/* Meta */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md bg-[#e8c800] px-2 py-0.5 text-[10px] uppercase tracking-widest text-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {news.source_name}
            </span>
            {news.category_name && (
              <span className="rounded-md border border-[#e8c800]/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#e8c800]">
                {news.category_emoji} {news.category_name}
              </span>
            )}
            <span
              className="text-[11px] uppercase tracking-wider text-zinc-400"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {formatRelative(news.published_at)}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-2xl uppercase leading-tight tracking-tight text-white sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {news.title}
          </h1>

          {/* Image */}
          {news.image_url && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl">
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

          {/* Description */}
          {news.description && (
            <p className="mt-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {news.description}
            </p>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#1f1f1f] pt-6">
            <Link
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e8c800] px-5 py-3 text-sm uppercase tracking-wider text-black transition hover:scale-[1.02]"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Leggi su {news.source_name}
              <ExternalLink className="h-4 w-4" />
            </Link>

            <BookmarkButton newsId={news.id} initialBookmarked={isBookmarked} />
            <span className="text-xs text-zinc-500">
              {isBookmarked ? 'Salvata nei preferiti' : 'Salva per dopo'}
            </span>
          </div>
        </article>

        {/* Related */}
        {otherNews.length > 0 && (
          <section className="mt-10">
            <h2
              className="mb-4 text-base uppercase tracking-tight text-white sm:text-xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Continua a <span className="text-[#e8c800]">leggere</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {otherNews.map((n) => (
                <NewsCard key={n.id} news={n} isBookmarked={bookmarks.has(n.id)} variant="compact" />
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
