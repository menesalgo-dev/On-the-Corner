/**
 * app/news/page.tsx — News v3
 *
 * Layout pulito senza doppi tab:
 *  1. Breadcrumb minimal
 *  2. UNA sola riga filtri: categoria principale (sticky, scroll H)
 *  3. Filtri fonte espandibili in BottomSheet/Disclosure (NON sempre a video)
 *  4. Grid news pulita
 *  5. Paginazione
 *
 * Niente più "TUTTI GLI SPORT + TUTTO + CALCIO" sovrapposti.
 */
import Link from 'next/link';
import { Home as HomeIcon, Filter, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { SourceFilter } from '@/components/news/SourceFilter';
import {
  getNewsItems,
  fetchUserBookmarkHashes,
  fetchCategoryCounts,
  fetchCategories,
} from '@/lib/news';
import { fetchMatchCountsByStatus } from '@/lib/sports/matches';

export const revalidate = 120;

const PAGE_SIZE = 24;

interface PageProps {
  searchParams: Promise<{ source?: string; category?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const cat = params.category && params.category !== 'all' && params.category !== 'tutto'
    ? params.category
    : undefined;
  return {
    title: cat ? `${cat} — On The Corner` : 'News sportive',
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

  const [newsResult, bookmarkHashes, counts, cats, matchCounts] = await Promise.all([
    getNewsItems({
      category: activeCategory,
      source: activeSource,
      page,
      limit: PAGE_SIZE,
    }),
    fetchUserBookmarkHashes(),
    fetchCategoryCounts(),
    fetchCategories(),
    fetchMatchCountsByStatus(),
  ]);

  const { news, count: totalCount } = newsResult;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-otc-accent"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span
            className="uppercase tracking-widest text-zinc-300"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            News
          </span>
          {activeCategory && (
            <>
              <span className="text-zinc-700">/</span>
              <span className="uppercase tracking-widest text-otc-accent">
                {activeCategory}
              </span>
            </>
          )}
        </nav>

        {/* Titolo */}
        <header className="mb-5">
          <h1
            className="text-3xl uppercase tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-archivo-black)', letterSpacing: '-0.02em' }}
          >
            {activeCategory ?? 'News'}<span className="text-otc-accent">.</span>
          </h1>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {totalCount > 0
              ? `${totalCount} articoli · pagina ${page}/${totalPages}`
              : 'Archivio completo'}
            {activeSource && (
              <span className="ml-2 text-otc-accent">
                · Fonte: {activeSource}
              </span>
            )}
          </p>
        </header>

        {/* Filtri categoria — UNA sola riga, scroll H sticky */}
        <CategoryStrip cats={cats} counts={counts} activeCategory={activeCategory} activeSource={activeSource} />

        {/* Filtro fonte espandibile (collapsed by default) */}
        <SourceFilter activeSource={activeSource} activeCategory={activeCategory} />

        {/* Lista news o empty */}
        {news.length === 0 ? (
          <EmptyState
            emoji="🔍"
            title="Nessuna notizia"
            description={
              activeSource
                ? `Nessun risultato per "${activeSource}"${activeCategory ? ` in ${activeCategory}` : ''}.`
                : 'Nessun risultato per i filtri attivi.'
            }
            actionLabel="Reset filtri"
            actionHref="/news"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </main>

      <Footer />
      <BottomNav liveCount={matchCounts.live} />
    </>
  );
}

/* ============================================================
 * CategoryStrip: una sola riga sticky con categorie
 * ============================================================ */
function CategoryStrip({
  cats, counts, activeCategory, activeSource,
}: {
  cats: { id: string; short_name?: string; name: string; emoji?: string }[];
  counts: Map<string, number>;
  activeCategory?: string;
  activeSource?: string;
}) {
  const buildHref = (catId: string | undefined) => {
    const sp = new URLSearchParams();
    if (catId && catId !== 'tutto') sp.set('category', catId);
    if (activeSource) sp.set('source', activeSource);
    const qs = sp.toString();
    return qs ? `/news?${qs}` : '/news';
  };

  return (
    <nav className="sticky top-[60px] z-20 -mx-4 mb-5 border-b border-otc-line bg-otc-bg/95 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:px-3 sm:py-2 sm:top-[72px]">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {cats.map((c) => {
          const active = c.id === 'tutto' ? !activeCategory : c.id === activeCategory;
          const count = counts.get(c.id) ?? 0;
          return (
            <Link
              key={c.id}
              href={buildHref(c.id === 'tutto' ? undefined : c.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                active
                  ? 'border-otc-accent bg-otc-accent text-black'
                  : 'border-otc-line bg-otc-surface text-zinc-400 hover:border-otc-accent/40 hover:text-otc-accent'
              }`}
            >
              {c.emoji && <span className="text-sm">{c.emoji}</span>}
              <span>{c.short_name ?? c.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] ${active ? 'text-black/60' : 'text-zinc-600'}`}
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ============================================================
 * Pagination
 * ============================================================ */
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
          className="rounded-lg border border-otc-line bg-otc-surface px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-otc-accent/40 hover:text-otc-accent"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          ← Prec
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-otc-line bg-otc-surface px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          ← Prec
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
          className="rounded-lg border border-otc-line bg-otc-surface px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-otc-accent/40 hover:text-otc-accent"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Succ →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-otc-line bg-otc-surface px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          Succ →
        </span>
      )}
    </nav>
  );
}
