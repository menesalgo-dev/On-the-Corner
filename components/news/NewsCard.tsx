/**
 * components/news/NewsCard.tsx
 * Card singola notizia con immagine, fonte, tempo relativo e bookmark.
 * Server-friendly per default; il bottone bookmark è isolato in client component.
 */
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkButton } from './BookmarkButton';
import { formatRelative } from '@/lib/utils';

interface NewsCardProps {
  id: string;
  title: string;
  link: string;
  description: string | null;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string;
  isBookmarked?: boolean;
  /** Variante visiva: 'default' su listing, 'hero' per la "In Evidenza". */
  variant?: 'default' | 'hero';
}

export function NewsCard({
  id, title, link, description, imageUrl, sourceName, publishedAt,
  isBookmarked = false, variant = 'default',
}: NewsCardProps) {
  const isHero = variant === 'hero';

  return (
    <article
      className={
        isHero
          ? 'group relative overflow-hidden rounded-3xl bg-[#0d0d0d] ring-1 ring-zinc-800'
          : 'group flex gap-3 rounded-2xl bg-[#0d0d0d] p-3 ring-1 ring-zinc-800 transition hover:ring-[#e8c800]/40'
      }
    >
      {/* Thumbnail */}
      {imageUrl && (
        <div className={isHero ? 'relative aspect-[16/9] w-full' : 'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28'}>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes={isHero ? '(min-width: 768px) 60vw, 100vw' : '128px'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            unoptimized   // i feed esterni non sono whitelistati in next.config
          />
          {isHero && <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent" />}
        </div>
      )}

      {/* Body */}
      <div className={isHero ? 'absolute inset-x-0 bottom-0 p-5 sm:p-6' : 'flex min-w-0 flex-1 flex-col'}>
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-md bg-[#e8c800] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
            {sourceName}
          </span>
          <span className="text-[11px] text-zinc-500">{formatRelative(publishedAt)}</span>
        </div>

        <Link href={link} target="_blank" rel="noopener noreferrer" prefetch={false} className="flex-1">
          <h3
            className={
              isHero
                ? 'font-[var(--font-archivo-black)] text-xl uppercase leading-tight text-white sm:text-3xl'
                : 'line-clamp-2 text-[15px] font-semibold leading-tight text-white group-hover:text-[#e8c800]'
            }
          >
            {title}
          </h3>
          {description && (
            <p className={isHero ? 'mt-2 line-clamp-2 max-w-2xl text-sm text-zinc-300' : 'mt-1 line-clamp-2 text-xs text-zinc-400'}>
              {description}
            </p>
          )}
        </Link>

        <div className={isHero ? 'mt-3' : 'mt-2 self-end'}>
          <BookmarkButton newsId={id} initial={isBookmarked} />
        </div>
      </div>
    </article>
  );
}
