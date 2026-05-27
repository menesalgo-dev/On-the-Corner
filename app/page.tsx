/**
 * app/page.tsx
 * Homepage dell'aggregatore sportivo premium.
 * Interamente allineata alle funzioni stabili basate sull'hash logico.
 */
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

// Forza la rigenerazione dinamica in tempo reale a ogni visita eliminando il vuoto statico
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Recupero parallelo delle notizie recenti e del set di hash salvati nei preferiti
  const [rawNews, bookmarkHashes] = await Promise.all([
    fetchLatestNews({ limit: 12 }), // Recupera le ultime 12 notizie in evidenza per la home
    fetchUserBookmarkHashes()
  ]);

  // Conversione pulita dei record PostgreSQL in oggetti NewsCardData (SnakeCase) attesi nativamente
  const featuredNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // Isolianto della prima notizia per la variante "hero" grande, le altre vanno nella griglia standard
  const heroItem = featuredNews[0];
  const gridItems = featuredNews.slice(1);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header />

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        
        {/* Sezione Notizia Hero in Evidenza */}
        {heroItem && (
          <section className="mb-10">
            <h2 
              className="mb-4 text-xs font-mono tracking-widest text-zinc-500 uppercase"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              // In evidenza ora
            </h2>
            <NewsCard 
              news={heroItem} 
              isBookmarked={bookmarkHashes.has(heroItem.id)} 
              variant="hero" 
            />
          </section>
        )}

        {/* Griglia delle ultime notizie */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b border-zinc-900 pb-3">
            <h2 
              className="text-xl uppercase tracking-tight font-black"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Ultime <span className="text-[#e8c800]">Notizie</span>
            </h2>
          </div>

          {gridItems.length === 0 && !heroItem ? (
            <p className="text-sm text-zinc-500 font-mono">Nessuna notizia disponibile nel feed di oggi.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gridItems.map((item) => (
                <NewsCard 
                  key={item.id} 
                  news={item} 
                  isBookmarked={bookmarkHashes.has(item.id)} 
                  variant="default"
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
