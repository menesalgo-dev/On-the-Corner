/**
 * app/sport/[category]/page.tsx
 * Pagina dinamica per il feed delle singole categorie sportive (calcio, f1, tennis, motogp).
 * Interamente allineata alle funzioni stabili basate sull'hash logico.
 */
import React from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { getNewsItems, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 120;

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const titleFormatted = category.toUpperCase();
  return {
    title: `${titleFormatted} — On The Corner`,
    description: `Tutte le ultime notizie premium su ${category}.`,
  };
}

export default async function SportCategoryPage({ params }: PageProps) {
  const { category } = await params;
  
  // Validazione rigida dei parametri ammessi dall'URL del frontend
  const allowedCategories = ['calcio', 'f1', 'tennis', 'motogp'];
  if (!allowedCategories.includes(category.toLowerCase())) {
    notFound();
  }

  // Recupero parallelo delle notizie della categoria e dei preferiti basati su hash
  const [newsData, bookmarkHashes] = await Promise.all([
    getNewsItems({
      category: category.toLowerCase(),
      page: 1,
      limit: 32
    }),
    fetchUserBookmarkHashes()
  ]);

  const { news: rawNews } = newsData;

  // Conversione immediata dei record del database nel formato NewsCardData (SnakeCase)
  const formattedNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // Mappatura statica delle icone per l'intestazione grafica originale
  const categoryHeaderMeta: Record<string, { title: string; desc: string }> = {
    'calcio': { title: 'Calcio⚽', desc: 'Notizie, indiscrezioni di mercato e approfondimenti in tempo reale.' },
    'f1': { title: 'Formula 1🏎️', desc: 'Tempi live, analisi tecniche e aggiornamenti dal paddock.' },
    'tennis': { title: 'Tennis🎾', desc: 'Risultati ATP/WTA, tornei dello Slam e aggiornamenti sui campioni.' },
    'motogp': { title: 'MotoGP🏍️', desc: 'Qualifiche, gare e retroscena dal motomondiale.' }
  };

  const currentHeader = categoryHeaderMeta[category.toLowerCase()] || { title: category, desc: '' };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header />

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        {/* Intestazione della Categoria Sportiva */}
        <header className="mb-8 border-b border-zinc-900 pb-4">
          <h1 
            className="text-3xl uppercase tracking-tight font-black text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {currentHeader.title.split(/(?=\p{Emoji})/u)[0]}
            <span className="text-[#e8c800]">{currentHeader.title.match(/\p{Emoji}/u)?.[0] || '.'}</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{currentHeader.desc}</p>
        </header>

        {/* Griglia Notizie Filtrate o Stato Vuoto se il database non ha record per lo sport */}
        {formattedNews.length === 0 ? (
          <div className="mt-12 flex justify-center">
            <EmptyState 
              title="Nessun Articolo" 
              description={`Non ci sono notizie disponibili al momento per la categoria ${category}.`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {formattedNews.map((item) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                isBookmarked={bookmarkHashes.has(item.id)} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
