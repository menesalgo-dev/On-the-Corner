/**
 * app/news/page.tsx
 * Feed completo delle notizie sportive con barra dei filtri integrata.
 * Allineato con esportazioni tipizzate e logica basata sull'hash.
 */
import React from 'react';
import Link from 'next/link';
import { getNewsItems, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';
import { NewsCard } from '@/components/news/NewsCard';
import { EmptyState } from '@/components/shared/EmptyState';

// Forza la rigenerazione dinamica in tempo reale a ogni visita eliminando il vuoto statico
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    source?: string;
    page?: string;
  }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentCategory = resolvedParams.category || 'tutto';
  const currentSource = resolvedParams.source || 'tutte fonti';
  const currentPage = Number(resolvedParams.page) || 1;
  const itemsPerPage = 24;

  // Recupero parallelo delle notizie filtrate e del set di hash salvati nei preferiti
  const [newsData, bookmarkHashes] = await Promise.all([
    getNewsItems({
      category: currentCategory,
      source: currentSource,
      page: currentPage,
      limit: itemsPerPage
    }),
    fetchUserBookmarkHashes()
  ]);

  const { news: rawNews, count: totalCount } = newsData;

  // Conversione nei record strutturati attesi da NewsCard
  const formattedNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // Lista delle categorie per la generazione dinamica della barra dei filtri
  const categories = [
    { id: 'tutto', label: 'Tutto' },
    { id: 'calcio', label: 'Calcio ⚽' },
    { id: 'f1', label: 'Formula 1 🏎️' },
    { id: 'tennis', label: 'Tennis 🎾' },
    { id: 'motogp', label: 'MotoGP 🏍️' },
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <main className="mx-auto max-w-[1400px] p-6 md:p-10">
        
        {/* Header Sezione con Titolo e Contatore Dinamico */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b border-zinc-800 pb-4">
          <div>
            <h1 
              className="text-3xl font-black uppercase tracking-tight text-[#e8c800]"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Notizie
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Feed aggregato da 21 fonti premium con dedup intelligente.
            </p>
          </div>
          <div 
            className="text-xs font-mono tracking-widest text-zinc-500 uppercase mt-2 md:mt-0"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {totalCount} {totalCount === 1 ? 'Risultato' : 'Risultati'}
          </div>
        </div>

        {/* Barra dei Filtri Sportivi (Tab di Navigazione) */}
        <nav className="mb-8 flex flex-wrap gap-2 border-b border-zinc-900 pb-4">
          {categories.map((cat) => {
            const isActive = currentCategory.toLowerCase() === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/news?category=${cat.id}${currentSource !== 'tutte fonti' ? `&source=${currentSource}` : ''}`}
                className={`rounded-xl px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all ${
                  isActive
                    ? 'bg-[#e8c800] text-black shadow-[0_4px_20px_rgba(232,200,0,0.2)]'
                    : 'bg-[#0d0d0d] border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                {cat.label}
              </Link>
            );
          })}
        </nav>

        {/* Griglia Notizie o Empty State */}
        {formattedNews.length === 0 ? (
          <div className="mt-12 flex justify-center">
            <EmptyState 
              title="Nessuna Notizia" 
              description={`Nessun risultato trovato nel database per la categoria "${currentCategory}".`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    </div>
  );
}
