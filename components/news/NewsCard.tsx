/**
 * components/news/NewsCard.tsx
 * Card notizia con due varianti: 'hero' (homepage top) e 'default' (grid).
 * Server component. Bookmark in client component separato.
 */
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import { formatRelative, cn } from '@/lib/utils';

export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  published_at: string;
}

interface Props {
  news: NewsCardData;
  isBookmarked?: boolean;
  variant?: 'hero' | 'default';
}

export function NewsCard({ news, isBookmarked = false, variant = 'default' }: Props) {
  const isHero = variant === 'hero';

  return (
    <article
      className={cn(
        'group relative overflow-hidden border border-otc-line bg-otc-surface transition',
        isHero
          ? 'rounded-3xl hover:border-otc-accent/40'
          : 'rounded-2xl hover:-translate-y-1 hover:border-otc-accent/40 hover:shadow-glow',
      )}
    >
      {/* Hero variant */}
      {isHero ? (
        <Link
          href={news.link}
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          className="block"
        >
          <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
            {news.image_url ? (
              <Image
                src={news.image_url}
                alt=""
                fill
                sizes="(min-width: 1024px) 800px, 100vw"
                className="object-cover"
                unoptimized
                priority
              />
            ) : (
              <FallbackThumb />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-otc-bg via-otc-bg/60 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-md bg-otc-accent px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-black">
                {news.source_name}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-otc-text-2">
                {formatRelative(news.published_at)}
              </span>
            </div>
            <h2 className="font-display text-xl uppercase leading-[1.05] tracking-tight sm:text-3xl lg:text-4xl">
              {news.title}
            </h2>
            {news.description && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-otc-text-2 sm:text-base">
                {news.description}
              </p>
            )}
          </div>
        </Link>
      ) : (
        // Default variant
        <>
          <Link
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="block"
          >
            <div className="relative aspect-[16/9] w-full">
              {news.image_url ? (
                <Image
                  src={news.image_url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <FallbackThumb />
              )}
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-otc-accent">
                  {news.source_name}
                </span>
                <span className="font-mono text-[10px] text-otc-text-3">
                  · {formatRelative(news.published_at)}
                </span>
              </div>
              <h3 className="line-clamp-3 font-display text-sm uppercase leading-tight tracking-tight transition group-hover:text-otc-accent sm:text-base">
                {news.title}
              </h3>
            </div>
          </Link>
          <div className="flex items-center justify-end border-t border-otc-line px-4 py-2">
            <BookmarkButton newsId={news.id} initialBookmarked={isBookmarked} />
          </div>
        </>
      )}

      {/* Bookmark sopra la hero */}
      {isHero && (
        <div className="absolute right-4 top-4 z-10">
          <BookmarkButton newsId={news.id} initialBookmarked={isBookmarked} variant="floating" />
        </div>
      )}
    </article>
  );
}

function FallbackThumb() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-otc-surface-2"
      style={{
        backgroundImage:
          'radial-gradient(circle at 30% 50%, rgba(232,200,0,0.08), transparent 60%), linear-gradient(135deg, #141414 0%, #0d0d0d 100%)',
      }}
    >
      <Bookmark className="h-10 w-10 text-otc-line" />
    </div>
  );
}

export function NewsCardSkeleton({ variant = 'default' }: { variant?: 'hero' | 'default' }) {
  const isHero = variant === 'hero';
  return (
    <div
      className={cn(
        'animate-pulse overflow-hidden border border-otc-line bg-otc-surface',
        isHero ? 'rounded-3xl' : 'rounded-2xl',
      )}
    >
      <div className={cn('w-full bg-otc-surface-2', isHero ? 'aspect-[21/9]' : 'aspect-[16/9]')} />
      <div className="space-y-3 p-4">
        <div className="h-3 w-24 rounded bg-otc-surface-2" />
        <div className="h-4 w-full rounded bg-otc-surface-2" />
        <div className="h-4 w-3/4 rounded bg-otc-surface-2" />
      </div>
    </div>
  );
}
