/**
 * app/live/page.tsx
 * Pagina match live. Placeholder per W4 (API sport).
 * Mantiene la struttura integrale complessa del blueprint originale con i fix di allineamento.
 */
import { Radio } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';

export const revalidate = 120;

export const metadata = {
  title: 'Live scores — Calcio, F1, Tennis, MotoGP',
  description: 'Risultati live aggiornati in tempo reale.',
};

export default async function LivePage() {
  const [rawNews, bookmarkHashes] = await Promise.all([
    fetchLatestNews({ limit: 6 }),
    fetchUserBookmarkHashes(),
  ]);

  // Costruiamo l'oggetto completo che soddisfa sia lo schema DB originale (snake_case)
  // sia i nuovi controlli basati su hash, senza distruggere i vecchi campi.
  const compliantNews = (rawNews || []).map((item: any) => ({
    ...item,
    id: item.hash, // Mantiene compatibilità se la card cerca item.id
    sourceId: item.source_id,
    sourceName: item.source_name,
    imageUrl: item.image_url,
    publishedAt: item.published_at,
    categoryId: item.category_id,
  }));

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-6">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Live<span className="text-[#e8c800]">.</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Risultati aggiornati in tempo reale per calcio, F1, MotoGP e tennis.
          </p>
        </header>

        {/* Coming soon - Struttura e stile premium originali intatti */}
        <section className="mb-10 overflow-hidden rounded-3xl border border-[#1f1f1f] bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500"
              style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
            >
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2
                className="text-xl uppercase tracking-tight text-white sm:text-2xl"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Match live in arrivo
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Stiamo integrando le API gratuite per i match live:
                Football-Data.org per il calcio, Jolpica per F1, ATP/WTA per il tennis,
                MotoGP API per le moto. Tra pochi giorni qui vedrai punteggi live,
                marcatori, eventi, classifiche e statistiche aggiornate al minuto.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['⚽ Serie A', '🏎️ F1', '🎾 ATP', '🏍️ MotoGP', '🏆 Champions', '🏈 NFL'].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-[#1f1f1f] bg-[#141414] px-3 py-1 text-xs text-zinc-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ultime news sportive */}
        <section>
          <h2
            className="mb-4 text-base uppercase tracking-tight sm:text-xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Ultime <span className="text-[#e8c800]">News</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compliantNews.map((item) => (
              <NewsCard 
                key={item.hash} 
                news={item as any} 
                isBookmarked={bookmarkHashes.has(item.hash)} 
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
