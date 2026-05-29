/**
 * app/news/page.tsx
 * Feed completo news con filtri categoria + fonte + paginazione.
 * Allineato alle funzioni reali di lib/news.ts:
 *   - getNewsItems(category, source, page, limit) → { news, count }
 *   - fetchUserBookmarkHashes() → Set<string>
 *   - fetchCategoryCounts() → Map<string, number>
 *   - fetchCategories() → categories array
 */
import Link from 'next/link';
import { ChevronLeft, Home as HomeIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  getNewsItems,
  fetchUserBookmarkHashes,
  fetchCategoryCounts,
  fetchCategories,
} from '@/lib/news';

export const revalidate = 120;

const PAGE_SIZE = 60;

// Lista fonti italiane più frequenti (in attesa di una fetchNewsStats backend)
const TOP_SOURCES = [
  'Gazzetta',
  'Corriere Sport',
  'Sky Sport',
  'Eurosport',
  'Tuttosport',
  'Repubblica Calcio',
  'Repubblica F1',
  'Repubblica Tennis',
  'SportMediaset',
  'ANSA Sport',
  'Calciomercato.com',
  'FormulaPassion',
  'GPone',
  'NewsAPI',
  'GNews',
];

interface PageProps {
  searchParams: Promise<{ source?: string; category?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const cat = params.category && params.category !== 'all' ? params.category : undefined;
  return {
    title: cat ? `News ${cat} — On The Corner` : 'Tutte le notizie sportive',
    description: 'Notizie aggregate da fonti italiane e internazionali.',
  };
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeSource = params.source && params.source !== 'all' ? params.source : undefined;
  const activeCategory = params.category && params.category !== 'all' && params.category !== 'tutto'
    ? params.category
    : undefined;
  const page = Math.max(1, parseInt(params.page ?? '1') || 1);

  // Chiamate parallele alle funzioni reali del backend
  const [newsResult, bookmarkHashes, counts, cats] = await Promise.all([
    getNewsItems({
      category: activeCategory,
      source: activeSource,
      page,
      limit: PAGE_SIZE,
    }),
    fetchUserBookmarkHashes(),
    fetchCategoryCounts(),
    fetchCategories(),
  ]);

  const { news, count: totalCount } = newsResult;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-[#e8c800]"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span
            className="uppercase tracking-widest text-zinc-300"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Archivio
          </span>
        </nav>

        {/* Header */}
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h1
              className="text-2xl uppercase tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {activeCategory ? activeCategory : 'Notizie'}<span className="text-[#e8c800]">.</span>
            </h1>
            <p
              className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {news.length} su {totalCount} · pagina {page}/{totalPages}
            </p>
          </div>
        </header>

        {/* Tabs categorie */}
        <CategoryTabs tabs={tabs} activeId={activeCategory} basePath="/news" />

        {/* Filtro fonti */}
        <nav className="mb-6 flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterChip
            href={`/news${activeCategory ? `?category=${activeCategory}` : ''}`}
            label="Tutte fonti"
            active={!activeSource}
          />
          {TOP_SOURCES.map((sourceName) => {
            const sp = new URLSearchParams();
            if (activeCategory) sp.set('category', activeCategory);
            sp.set('source', sourceName);
            return (
              <FilterChip
                key={sourceName}
                href={`/news?${sp.toString()}`}
                label={sourceName}
                active={activeSource === sourceName}
              />
            );
          })}
        </nav>

        {/* Lista o empty */}
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
            {news.map((item: any) => (
              <NewsCard
                key={item.id}
                news={item}
                isBookmarked={bookmarkHashes.has(item.hash) || bookmarkHashes.has(item.id)}
              />
            ))}
          </div>
        )}

        {/* Paginazione */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            category={activeCategory}
            source={activeSource}
          />
        )}

        {/* CTA torna alla home */}
        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] py-3 text-xs uppercase tracking-widest text-zinc-400 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          Torna alla home
        </Link>
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

function Pagination({
  page, totalPages, category, source,
}: { page: number; totalPages: number; category?: string; source?: string }) {
  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (source) sp.set('source', source);
    sp.set('page', String(p));
    return `/news?${sp.toString()}`;
  };

  const prevHref = page > 1 ? buildHref(page - 1) : null;
  const nextHref = page < totalPages ? buildHref(page + 1) : null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {prevHref ? (
        <Link
          href={prevHref}
          className="rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          ← Precedente
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          ← Precedente
        </span>
      )}
      <span
        className="px-3 text-xs uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Successivo →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          Successivo →
        </span>
      )}
    </nav>
  );
}
