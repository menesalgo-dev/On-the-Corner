/**
 * app/page.tsx
 * Homepage media: hero notizia + grid + tab + sidebar + live strip.
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Ticker } from '@/components/layout/Ticker';
import { LiveStrip } from '@/components/layout/LiveStrip';
import { NewsCard, NewsCardSkeleton } from '@/components/news/NewsCard';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  fetchLatestNews,
  fetchUserBookmarkIds,
  fetchTickerItems,
  fetchCategoryCounts,
  fetchNewsStats,
  fetchCategories,
} from '@/lib/news';

export const revalidate = 120; // ogni 2 minuti

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const tickerItems = await fetchTickerItems();

  return (
    <>
      <Header />
      <Ticker items={tickerItems} />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        <Suspense fallback={<TabsFallback />}>
          <CategoryTabsServer activeId={params.category} />
        </Suspense>

        <Suspense fallback={<HomepageSkeleton />}>
          <HomepageContent categoryId={params.category} />
        </Suspense>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

async function CategoryTabsServer({ activeId }: { activeId?: string }) {
  const [cats, counts] = await Promise.all([fetchCategories(), fetchCategoryCounts()]);
  const tabs = cats.map((c) => ({
    id: c.id,
    name: c.short_name ?? c.name,
    emoji: c.emoji ?? undefined,
    count: counts.get(c.id) ?? 0,
  }));
  return <CategoryTabs tabs={tabs} activeId={activeId} basePath="/" />;
}

async function HomepageContent({ categoryId }: { categoryId?: string }) {
  const [news, bookmarks, stats] = await Promise.all([
    fetchLatestNews({ limit: 25, categoryId }),
    fetchUserBookmarkIds(),
    fetchNewsStats(),
  ]);

  if (news.length === 0) {
    return (
      <EmptyState
        emoji="📰"
        title="Nessuna notizia"
        description="Le notizie verranno popolate dal cron sync-news. Attendi qualche minuto."
      />
    );
  }

  const [hero, ...rest] = news;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {/* Hero */}
        {hero && <NewsCard news={hero} isBookmarked={bookmarks.has(hero.id)} variant="hero" />}

        {/* Live Strip - placeholder, sarà vero in W4 */}
        <LiveStrip />

        {/* Section: In evidenza */}
        <section>
          <header className="mb-4 flex items-baseline justify-between">
            <h2
              className="text-base uppercase tracking-tight text-white sm:text-xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              In <span className="text-[#e8c800]">Evidenza</span>
            </h2>
            <Link
              href="/news"
              className="text-[11px] uppercase tracking-widest text-zinc-400 transition hover:text-[#e8c800]"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Tutte →
            </Link>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 9).map((item) => (
              <NewsCard key={item.id} news={item} isBookmarked={bookmarks.has(item.id)} />
            ))}
          </div>
        </section>

        {/* Section: Tutte le altre */}
        {rest.length > 9 && (
          <section>
            <header className="mb-4">
              <h2
                className="text-base uppercase tracking-tight text-white sm:text-xl"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Altre <span className="text-[#e8c800]">Notizie</span>
              </h2>
            </header>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rest.slice(9).map((item) => (
                <NewsCard key={item.id} news={item} isBookmarked={bookmarks.has(item.id)} variant="compact" />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden space-y-4 lg:block">
        <SidebarPanel title="Fonti">
          <ul className="space-y-2.5 text-sm">
            {stats.sources.slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      s.count >= 5
                        ? 'bg-emerald-500 shadow-[0_0_6px_currentColor]'
                        : s.count > 0
                          ? 'bg-[#e8c800]'
                          : 'bg-zinc-700'
                    }`}
                  />
                  <span className="text-white">{s.name}</span>
                </span>
                <span
                  className="text-xs tabular-nums text-zinc-400"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        </SidebarPanel>

        <SidebarPanel title="Personalizza">
          <p className="mb-3 text-xs text-zinc-400">
            Crea un account per seguire le tue squadre e ricevere un feed personalizzato.
          </p>
          <Link
            href="/signup"
            className="block rounded-xl bg-[#e8c800] py-2.5 text-center text-xs uppercase tracking-wider text-black transition hover:scale-[1.02]"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Inizia gratis
          </Link>
        </SidebarPanel>

        <SidebarPanel title="Esplora">
          <div className="grid grid-cols-2 gap-2">
            {['calcio', 'f1', 'tennis', 'motogp', 'champions', 'nfl'].map((s) => (
              <Link
                key={s}
                href={`/sport/${s}`}
                className="rounded-lg border border-[#1f1f1f] bg-[#141414] px-3 py-2 text-center text-[11px] uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
              >
                {s}
              </Link>
            ))}
          </div>
        </SidebarPanel>
      </aside>
    </div>
  );
}

function SidebarPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
      <h3
        className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {title}
        <span className="h-px flex-1 bg-[#1f1f1f]" />
      </h3>
      {children}
    </section>
  );
}

function TabsFallback() {
  return <div className="h-[52px]" />;
}

function HomepageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <NewsCardSkeleton variant="hero" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
