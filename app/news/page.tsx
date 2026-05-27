/**
 * app/news/page.tsx
 * Pagina di archivio e catalogo completo delle notizie.
 */
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { fetchLatestNews, fetchCategories, fetchCategoryCounts, fetchUserBookmarkIds } from '@/lib/news';

// ✅ FORZIAMO LA PAGINA AD AGGIORNARSI IN TEMPO REALE AD OGNI VISITA
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ category?: string; source?: string }>;
}

export default async function NewsArchivePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentCategory = params.category || 'tutto';

  return (
    <>
      <Header />
      
      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          Tutte le <span className="text-[#e8c800]">Notizie</span>
        </h1>

        <Suspense fallback={<div className="h-[52px]" />}>
          <CategoryTabsServer activeId={currentCategory} />
        </Suspense>

        <Suspense fallback={<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6"><div className="h-40 bg-zinc-900 rounded-xl animate-pulse" /></div>}>
          <NewsGridContent categoryId={currentCategory} sourceId={params.source} />
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
  return <CategoryTabs tabs={tabs} activeId={activeId} basePath="/news" />;
}

async function NewsGridContent({ categoryId, sourceId }: { categoryId?: string; sourceId?: string }) {
  // Usiamo la funzione funzionante diretta sulla tabella news_items
  const [news, bookmarks] = await Promise.all([
    fetchLatestNews({ limit: 40, categoryId }),
    fetchUserBookmarkIds()
  ]);

  if (!news || news.length === 0) {
    return (
      <EmptyState
        emoji="📰"
        title="Nessuna notizia trovata"
        description="Non ci sono articoli disponibili per questa selezione. Esegui il sync manuale."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} isBookmarked={bookmarks.has(item.id)} />
      ))}
    </div>
  );
}
