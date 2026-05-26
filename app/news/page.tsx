/**
 * app/news/page.tsx
 * Feed completo news con filtri categoria + fonte.
 */
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  fetchNewsPage,
  fetchUserBookmarkIds,
  fetchNewsStats,
  fetchCategoryCounts,
  fetchCategories,
} from '@/lib/news';

export const revalidate = 120;

export const metadata = {
  title: 'Tutte le notizie sportive',
  description: 'Notizie aggregate da 21 fonti italiane e internazionali.',
};

interface PageProps {
  searchParams: Promise<{ source?: string; category?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeSource = params.source && params.source !== 'all' ? params.source : undefined;
  const activeCategory = params.category && params.category !== 'all' ? params.category : undefined;

  const [news, bookmarks, stats, counts, cats] = await Promise.all([
    fetchNewsPage({ limit: 60, sourceId: activeSource, categoryId: activeCategory }),
    fetchUserBookmarkIds(),
    fetchNewsStats(),
    fetchCategoryCounts(),
    fetchCategories(),
  ]);

  const tabs = cats.map((c) => ({
    id: c.id,
    name: c.short_name ?? c.name,
    emoji: c.emoji ?? undefined,
    count: counts.get(c.id) ?? 0,
  }));

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-4 flex items-baseline justify-between">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Notizie<span className="text-[#e8c800]">.</span>
          </h1>
          <span
            className="text-xs uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {news.length} risultati
          </span>
        </header>

        <CategoryTabs tabs={tabs} activeId={activeCategory} basePath="/news" />

        {/* Filtro fonti */}
        <nav className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterChip
            href={`/news${activeCategory ? `?category=${activeCategory}` : ''}`}
            label="Tutte fonti"
            active={!activeSource}
          />
          {stats.sources.slice(0, 15).map((s) => {
            const sp = new URLSearchParams();
            if (activeCategory) sp.set('category', activeCategory);
            sp.set('source', s.id);
            return (
              <FilterChip
                key={s.id}
                href={`/news?${sp.toString()}`}
                label={s.name}
                count={s.count}
                active={activeSource === s.id}
              />
            );
          })}
        </nav>

        {news.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Nessuna notizia"
            description="Nessun risultato per i filtri attivi."
            actionLabel="Reset filtri"
            actionHref="/news"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} isBookmarked={bookmarks.has(item.id)} />
            ))}
          </div>
        )}
      </main>

      <Footer />
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
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
        active
          ? 'border-[#e8c800] bg-[#e8c800] text-black'
          : 'border-[#1f1f1f] bg-[#0d0d0d] text-zinc-400 hover:border-[#e8c800]/40 hover:text-[#e8c800]'
      }`}
    >
      {label}
      {count !== undefined && !active && (
        <span className="ml-1.5 text-[10px] text-zinc-600" style={{ fontFamily: 'var(--font-dm-mono)' }}>
          {count}
        </span>
      )}
    </Link>
  );
}
