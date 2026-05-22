/**
 * app/news/page.tsx — Feed completo notizie con filtro per fonte.
 * URL: /news?source=g (filtra per Gazzetta), /news?source=all (default)
 */
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchNewsPage, fetchUserBookmarkIds, fetchNewsStats } from '@/lib/news';
import { cn } from '@/lib/utils';

export const revalidate = 300;

interface PageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeSource = params.source && params.source !== 'all' ? params.source : undefined;

  const [news, bookmarks, stats] = await Promise.all([
    fetchNewsPage({ limit: 40, sourceId: activeSource }),
    fetchUserBookmarkIds(),
    fetchNewsStats(),
  ]);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <div className="mb-6 flex items-baseline justify-between">
          <h1 className="font-display text-2xl uppercase tracking-tight sm:text-4xl">
            Notizie<span className="text-otc-accent">.</span>
          </h1>
          <span className="font-mono text-xs uppercase tracking-widest text-otc-text-3">
            {news.length} risultati
          </span>
        </div>

        {/* Filtri fonti (scroll orizzontale su mobile) */}
        <nav
          className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none' }}
        >
          <FilterChip href="/news" label="Tutte" active={!activeSource} />
          {stats.sources.slice(0, 15).map((s) => (
            <FilterChip
              key={s.id}
              href={`/news?source=${s.id}`}
              label={s.name}
              count={s.count}
              active={activeSource === s.id}
            />
          ))}
        </nav>

        {news.length === 0 ? (
          <div className="rounded-2xl border border-otc-line bg-otc-surface p-10 text-center">
            <p className="text-otc-text-2">Nessuna notizia trovata per questa fonte.</p>
            <Link
              href="/news"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-otc-accent hover:underline"
            >
              ← Mostra tutte
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                isBookmarked={bookmarks.has(item.id)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  );
}

function FilterChip({
  href, label, count, active,
}: { href: string; label: string; count?: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition',
        active
          ? 'border-otc-accent bg-otc-accent text-black'
          : 'border-otc-line bg-otc-surface text-otc-text-2 hover:border-otc-accent/40 hover:text-otc-accent',
      )}
    >
      {label}
      {count !== undefined && !active && (
        <span className="ml-1.5 font-mono text-[10px] text-otc-text-3">{count}</span>
      )}
    </Link>
  );
}
