/**
 * components/news/NewsCard.tsx
 * Card notizia Premium Minimal - Varianti: hero, default, compact.
 * Schema snake_case allineato al resto del progetto.
 */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import { formatRelative } from '@/lib/utils';
import type { NewsCardData } from '@/lib/news/types';

interface Props {
  news: NewsCardData;
  isBookmarked?: boolean;
  variant?: 'hero' | 'default' | 'compact';
}

interface InternalProps {
  news: NewsCardData;
  isBookmarked: boolean;
}

export function NewsCard({ news, isBookmarked = false, variant = 'default' }: Props) {
  if (variant === 'hero') return <HeroVariant news={news} isBookmarked={isBookmarked} />;
  if (variant === 'compact') return <CompactVariant news={news} isBookmarked={isBookmarked} />;
  return <DefaultVariant news={news} isBookmarked={isBookmarked} />;
}

function HeroVariant({ news, isBookmarked }: InternalProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-otc-line bg-otc-surface transition duration-300 hover:border-zinc-700/80">
      <Link href={`/news/${news.id}`} prefetch={false} className="block">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] bg-otc-bg">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-[1.01] group-hover:opacity-100"
              unoptimized
              priority
            />
          ) : (
            <FallbackThumb />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-otc-bg via-otc-bg/50 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
            <span className="text-otc-accent font-bold">{news.source_name}</span>
            <span className="text-zinc-700">•</span>
            {news.category_name && (
              <>
                <span className="text-zinc-300">{news.category_name}</span>
                <span className="text-zinc-700">•</span>
              </>
            )}
            <span suppressHydrationWarning>{formatRelative(news.published_at)}</span>
          </div>
          <h2
            className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl lg:text-3xl max-w-4xl group-hover:text-otc-accent transition-colors duration-200 uppercase leading-[1.05]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {news.title}
          </h2>
          {news.description && (
            <p className="mt-2 line-clamp-4 max-w-3xl text-xs text-zinc-400 leading-relaxed font-normal">
              {news.description}
            </p>
          )}
        </div>
      </Link>
      <div className="absolute right-4 top-4 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
        <BookmarkButton newsHash={news.id} initialBookmarked={isBookmarked} />
      </div>
    </article>
  );
}

function DefaultVariant({ news, isBookmarked }: InternalProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-otc-line bg-otc-surface transition duration-300 hover:-translate-y-0.5 hover:border-zinc-700/60 hover:shadow-glow">
      <Link href={`/news/${news.id}`} prefetch={false} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-otc-bg border-b border-otc-line">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover opacity-85 transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              unoptimized
            />
          ) : (
            <FallbackThumb />
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
            <span className="text-otc-accent font-bold">{news.source_name}</span>
            <span>•</span>
            <span suppressHydrationWarning>{formatRelative(news.published_at)}</span>
          </div>
          <h3
            className="line-clamp-2 text-sm font-bold uppercase leading-tight tracking-tight text-zinc-200 group-hover:text-otc-accent transition-colors duration-200 mb-2.5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {news.title}
          </h3>
          {news.description && (
            <p className="line-clamp-3 text-xs text-zinc-500 leading-relaxed font-normal">
              {news.description}
            </p>
          )}
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-otc-line px-4 py-2.5 bg-[#050507] mt-auto">
        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
          {news.category_name || 'Sport'}
        </span>
        <div className="opacity-40 group-hover:opacity-100 transition-opacity">
          <BookmarkButton newsHash={news.id} initialBookmarked={isBookmarked} />
        </div>
      </div>
    </article>
  );
}

function CompactVariant({ news }: InternalProps) {
  return (
    <article className="group flex gap-3 rounded-lg border border-otc-line bg-otc-surface p-2 transition duration-200 hover:border-zinc-800/80">
      <Link href={`/news/${news.id}`} prefetch={false} className="flex flex-1 gap-3 items-center">
        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded bg-otc-bg border border-otc-line">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="56px"
              className="object-cover opacity-85"
              unoptimized
            />
          ) : (
            <FallbackThumb compact />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="mb-0.5 flex items-center gap-1.5 text-[8px] font-mono uppercase tracking-wider text-zinc-500">
            <span className="text-otc-accent">{news.source_name}</span>
            <span>•</span>
            <span suppressHydrationWarning>{formatRelative(news.published_at)}</span>
          </div>
          <h4 className="line-clamp-1 text-xs font-semibold leading-tight text-zinc-300 group-hover:text-otc-accent transition-colors">
            {news.title}
          </h4>
        </div>
        <ArrowUpRight className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity mr-1" />
      </Link>
    </article>
  );
}

function FallbackThumb({ compact }: { compact?: boolean } = {}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-otc-surface-2 border border-otc-line/40 rounded-lg">
      <Bookmark className={compact ? 'h-3 w-3 text-zinc-800' : 'h-5 w-5 text-zinc-800'} />
    </div>
  );
}
