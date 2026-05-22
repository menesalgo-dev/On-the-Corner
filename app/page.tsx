/**
 * app/page.tsx — Homepage di On The Corner (Settimana 2).
 * Server Component: legge le news dal DB, mostra hero + grid + sidebar.
 */
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard, NewsCardSkeleton } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkIds, fetchNewsStats } from '@/lib/news';
import { Suspense } from 'react';

// Revalidate ogni 5 minuti — combacia con la frequenza media del cron RSS.
export const revalidate = 300;

export default async function HomePage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <Suspense fallback={<HomePageSkeleton />}>
          <HomePageContent />
        </Suspense>
      </main>

      <BottomNav />
    </>
  );
}

async function HomePageContent() {
  const [news, bookmarks, stats] = await Promise.all([
    fetchLatestNews(25),
    fetchUserBookmarkIds(),
    fetchNewsStats(),
  ]);

  // Stato vuoto: nessuna notizia ancora nel DB.
  if (news.length === 0) {
    return <EmptyState />;
  }

  const [hero, ...rest] = news;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      {/* CENTRO */}
      <div className="space-y-6">
        {/* HERO */}
        {hero && (
          <NewsCard
            news={hero}
            isBookmarked={bookmarks.has(hero.id)}
            variant="hero"
          />
        )}

        {/* In evidenza */}
        <SectionHeader title="In Evidenza" linkHref="/news" linkLabel="Tutte →" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <NewsCard
              key={item.id}
              news={item}
              isBookmarked={bookmarks.has(item.id)}
            />
          ))}
        </div>
      </div>

      {/* SIDEBAR (solo lg+) */}
      <aside className="hidden space-y-4 lg:block">
        <SidebarPanel title="Statistiche">
          <div className="grid grid-cols-2 gap-3">
            <Stat value={stats.total} label="Notizie" />
            <Stat value={stats.sources.length} label="Fonti attive" highlight />
          </div>
        </SidebarPanel>

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
                          ? 'bg-otc-accent'
                          : 'bg-otc-danger'
                    }`}
                  />
                  <span className="text-otc-text">{s.name}</span>
                </span>
                <span className="font-mono text-xs tabular-nums text-otc-text-2">
                  {s.count}
                </span>
              </li>
            ))}
          </ul>
        </SidebarPanel>

        <SidebarPanel title="Seguiti">
          <p className="text-center text-xs text-otc-text-3">
            Non segui ancora nulla.
            <br />
            <Link href="/follow" className="mt-2 inline-block font-mono uppercase tracking-wider text-otc-accent hover:underline">
              Scopri squadre →
            </Link>
          </p>
        </SidebarPanel>
      </aside>
    </div>
  );
}

function SectionHeader({ title, linkHref, linkLabel }: { title: string; linkHref: string; linkLabel: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-base uppercase tracking-tight sm:text-lg">
        In <span className="text-otc-accent">Evidenza</span>
      </h2>
      <Link
        href={linkHref}
        className="font-mono text-[11px] uppercase tracking-widest text-otc-text-2 transition hover:text-otc-accent"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function SidebarPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-otc-line bg-otc-surface p-5">
      <h3 className="mb-4 flex items-center gap-3 font-display text-[10px] uppercase tracking-[0.15em] text-otc-text-3">
        {title}
        <span className="h-px flex-1 bg-otc-line" />
      </h3>
      {children}
    </section>
  );
}

function Stat({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-otc-line bg-otc-surface-2 p-3">
      <div
        className={`font-display text-2xl leading-none ${
          highlight ? 'text-otc-accent' : 'text-white'
        }`}
        style={highlight ? { textShadow: '0 0 18px rgba(232,200,0,0.4)' } : {}}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-otc-text-2">
        {label}
      </div>
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
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

function EmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-otc-line bg-otc-surface p-10 text-center">
      <div className="mb-4 text-5xl">📰</div>
      <h2 className="mb-2 font-display text-xl uppercase">Niente notizie ancora</h2>
      <p className="text-sm text-otc-text-2">
        L'aggregatore RSS sta lavorando. Le notizie compaiono qui automaticamente,
        di solito entro 15 minuti dalla prima esecuzione del cron.
      </p>
      <div className="mt-6 rounded-xl border border-otc-line bg-otc-surface-2 p-4 text-left">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-otc-text-3">
          Come popolare il DB
        </div>
        <p className="font-mono text-xs text-otc-text-2">
          Esegui manualmente la Edge Function <span className="text-otc-accent">sync-news</span>
          {' '}da Supabase Dashboard, oppure attendi il prossimo ciclo del cron.
        </p>
      </div>
    </div>
  );
}
