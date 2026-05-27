/**
 * app/news/page.tsx
 * Feed completo delle notizie sportive con layout liquido minimale ed editoriale.
 * Allineato con esportazioni tipizzate, logica ad hash e navigazione protetta.
 */
import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
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

  // Conversione nei record strutturati e pulizia dei glitch tipografici dei feed (es. &#8217; / &quot;)
  const formattedNews = (rawNews || []).map((row: any) => {
    const item = toNewsCardData(row);
    if (item.title) {
      item.title = item.title
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&');
    }
    return item;
  });

  // Lista delle categorie per lo slider orizzontale privo di icone ed emoji pesanti
  const categories = [
    { id: 'tutto', label: 'Tutti gli Sport' },
    { id: 'calcio', label: 'Calcio' },
    { id: 'f1', label: 'Formula 1' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'motogp', label: 'MotoGP' },
  ];

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <main className="mx-auto max-w-[1380px] px-6 py-8 md:py-10">
        
        {/* Header di Sezione con Breadcrumb Innovativo e Tasto Home Direct */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-5 border-b border-otc-line">
          <div>
            {/* Percorso di Navigazione Filiforme Minimalista */}
            <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-otc-accent">
                <Home className="h-3 w-3" />
                Home
              </Link>
              <ChevronRight className="h-2.5 w-2.5 text-zinc-700" />
              <span className="text-zinc-400">Feed notizie</span>
            </div>

            <h1 
              className="text-xl font-bold uppercase tracking-widest text-zinc-200 font-mono"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Notizie<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
              Archivio premium sportivo filtrato e deduplicato in tempo reale da 21 testate globali.
            </p>
          </div>
          
          <div 
            className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-3 md:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded-md"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {totalCount} {totalCount === 1 ? 'Record Trovato' : 'Record Trovati'}
          </div>
        </div>

        {/* Dynamic Hub Slider Orizzontale (Interfaccia Piatta ad Aggancio Inferiore Attivo) */}
        <div className="overflow-x-auto scrollbar-none mb-8 border-b border-otc-line/60">
          <nav className="flex gap-1 whitespace-nowrap min-w-max pb-px">
            {categories.map((cat) => {
              const isActive = currentCategory.toLowerCase() === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/news?category=${cat.id}${currentSource !== 'tutte fonti' ? `&source=${currentSource}` : ''}`}
                  className={`relative px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors duration-200 -mb-px border-b-2 ${
                    isActive
                      ? 'border-otc-accent text-zinc-100 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Griglia Notizie Premium Minimal o Schermata di Avviso */}
        {formattedNews.length === 0 ? (
          <div className="mt-16 flex justify-center">
            <EmptyState 
              title="Nessun Record" 
              description={`Nessun articolo trovato all'interno del database per la categoria "${currentCategory}".`}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
