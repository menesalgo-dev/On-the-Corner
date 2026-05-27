/**
 * app/sport/[category]/page.tsx
 * Pagina dedicata a un singolo sport (calcio, f1, tennis, motogp, champions, nfl).
 */
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { fetchLatestNews, fetchUserBookmarkIds, fetchCategories } from '@/lib/news';

export const revalidate = 120;

const VALID_CATEGORIES = ['calcio', 'champions', 'f1', 'motogp', 'tennis', 'nfl'];

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category)) return { title: 'Sport non trovato' };
  const cats = await fetchCategories();
  const cat = cats.find((c) => c.id === category);
  return {
    title: cat?.name ?? category,
    description: `Tutte le notizie di ${cat?.name ?? category} aggregate dalle migliori fonti.`,
  };
}

export default async function SportPage({ params }: PageProps) {
  const { category } = await params;
  if (!VALID_CATEGORIES.includes(category)) notFound();

  const [cats, news, bookmarks] = await Promise.all([
    fetchCategories(),
    fetchLatestNews({ limit: 30, categoryId: category }),
    fetchUserBookmarkIds(),
  ]);

  const cat = cats.find((c) => c.id === category);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{cat?.emoji ?? '📰'}</span>
            <div>
              <h1
                className="text-2xl uppercase tracking-tight sm:text-4xl"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                {cat?.name ?? category}<span className="text-[#e8c800]">.</span>
              </h1>
              <p
                className="mt-1 text-[11px] uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {news.length} notizie · ultimi 7 giorni
              </p>
            </div>
          </div>
        </header>

        {news.length === 0 ? (
          <EmptyState
            emoji={cat?.emoji ?? '📭'}
            title={`Nessuna notizia ${cat?.name ?? ''}`}
            description="Il feed verrà aggiornato dal cron sync-news. Attendi qualche minuto."
            actionLabel="Torna alla home"
            actionHref="/"
          />
        ) : (
          <>
            {/* Hero notizia top */}
            {news[0] && (
              <div className="mb-6">
                <NewsCard news={news[0]} isBookmarked={bookmarks.has(news[0].id)} variant="hero" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {news.slice(1).map((item) => (
                <NewsCard key={item.id} news={item} isBookmarked={bookmarks.has(item.id)} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
