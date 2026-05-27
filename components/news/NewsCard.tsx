/**
 * components/news/NewsCard.tsx
 * Card notizia con 3 varianti: hero, default, compact.
 * Corretto: Naviga sulle pagine interne di dettaglio usando l'hash.
 */
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';
import { formatRelative } from '@/lib/utils';

export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  published_at: string;
  category_id?: string | null;
  category_name?: string | null;
  category_emoji?: string | null;
}

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
    <article className="group relative overflow-hidden rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] transition hover:border-[#e8c800]/40">
      {/* CORREZIONE: Punta al dettaglio interno /news/[hash] senza target _blank */}
      <Link href={`/news/${news.id}`} prefetch={false} className="block">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 900px, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
              priority
            />
          ) : (
            <FallbackThumb />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="mb-3 flex items-center gap-2">
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
            <span className="text-[11px] uppercase tracking-wider text-zinc-400" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              {formatRelative(news.published_at)}
            </span>
          </div>
          <h2
            className="text-xl uppercase leading-[1.05] tracking-tight text-white sm:text-3xl lg:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {news.title}
          </h2>
          {news.description && (
            <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-zinc-300 sm:text-base">
              {news.description}
            </p>
          )}
        </div>
      </Link>
      <div className="absolute right-4 top-4 z-10">
        <BookmarkButton newsHash={news.id} initialBookmarked={isBookmarked} />
      </div>
    </article>
  );
}

function DefaultVariant({ news, isBookmarked }: InternalProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] transition hover:-translate-y-1 hover:border-[#e8c800]/40 hover:shadow-[0_14px_40px_-20px_rgba(232,200,0,0.35)]">
      {/* CORREZIONE: Punta al dettaglio interno /news/[hash] senza target _blank */}
      <Link href={`/news/${news.id}`} prefetch={false} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <FallbackThumb />
          )}
          {news.category_emoji && (
            <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs backdrop-blur-sm">
              {news.category_emoji}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="text-[10px] uppercase tracking-widest text-[#e8c800]"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {news.source_name}
            </span>
            <span className="text-[10px] text-zinc-600" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              · {formatRelative(news.published_at)}
            </span>
          </div>
          <h3
            className="line-clamp-3 text-sm uppercase leading-tight tracking-tight text-white transition group-hover:text-[#e8c800] sm:text-base"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {news.title}
          </h3>
        </div>
      </Link>
      <div className="flex items-center justify-between border-t border-[#1f1f1f] px-4 py-2">
        {news.category_name ? (
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{news.category_name}</span>
        ) : (
          <span />
        )}
        <BookmarkButton newsHash={news.id} initialBookmarked={isBookmarked} />
      </div>
    </article>
  );
}

function CompactVariant({ news }: InternalProps) {
  return (
    <article className="group flex gap-3 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-2.5 transition hover:border-[#e8c800]/40">
      {/* CORREZIONE: Punta al dettaglio interno /news/[hash] senza target _blank */}
      <Link href={`/news/${news.id}`} prefetch={false} className="flex flex-1 gap-3">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
          {news.image_url ? (
            <Image
              src={news.image_url}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <FallbackThumb compact />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-[#e8c800]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              {news.source_name}
            </span>
            <span className="text-[9px] text-zinc-600">·</span>
            <span className="text-[9px] text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              {formatRelative(news.published_at)}
            </span>
          </div>
          <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-white transition group-hover:text-[#e8c800]">
            {news.title}
          </h3>
        </div>
      </Link>
    </article>
  );
}

function FallbackThumb({ compact }: { compact?: boolean } = {}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-[#141414]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 30% 50%, rgba(232,200,0,0.08), transparent 60%), linear-gradient(135deg, #141414 0%, #0d0d0d 100%)',
      }}
    >
      <Bookmark className={compact ? 'h-5 w-5 text-[#1f1f1f]' : 'h-10 w-10 text-[#1f1f1f]'} />
    </div>
  );
}
