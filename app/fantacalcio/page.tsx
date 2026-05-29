/**
 * app/fantacalcio/page.tsx
 * Sezione Speciale Fantacalcio - Consigli, probabili formazioni e ultim'ora.
 * Interamente connesso alle query dirette di Supabase.
 */
import React from 'react';
import { Trophy, ShieldAlert, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { getNewsItems, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';
import { EmptyState } from '@/components/shared/EmptyState';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Fantacalcio Hub — Probabili Formazioni e Consigli OTC',
  description: 'Guida al Fantacalcio: ballottaggi, indiscrezioni dai campi e analisi rigorose.',
};

export default async function FantacalcioPage() {
  // Richiede al database tutti i record associati al tag o id del fantacalcio
  const [newsData, bookmarkHashes] = await Promise.all([
    getNewsItems({
      category: 'fantacalcio',
      page: 1,
      limit: 24
    }),
    fetchUserBookmarkHashes()
  ]);

  const { news: rawNews, count: totalCount } = newsData;
  const formattedNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <Header />

      <main className="mx-auto max-w-[1340px] px-6 py-8 md:py-12">
        
        {/* Intestazione Editoriale di Sezione */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-5 border-b border-otc-line">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
              Focus Campionato & Strategie
            </div>
            <h1 
              className="text-xl font-bold uppercase tracking-widest text-zinc-200 font-mono"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Fantacalcio<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
              Indiscrezioni dai campi, probabili formazioni aggiornate, ballottaggi dell&apos;ultimo minuto e indici di schierabilità.
            </p>
          </div>
          
          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-3 md:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded-md">
            {totalCount} Articoli Trovati
          </div>
        </header>

        {/* 🛠️ STRUMENTI AGGIUNTIVI FANTACALCIO (MICRO-DASHBOARD INFORMATIVA) */}
        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: Trophy, label: 'Guida Strategica', desc: 'Indici di schierabilità e analisi rigorosa dei tiratori.' },
            { icon: ShieldAlert, label: 'Infermeria & Squalifiche', desc: 'Report medici aggiornati al minuto e tempi di recupero.' },
            { icon: Sparkles, label: 'Consigli Top 11', desc: 'I migliori portieri, difensori, centrocampisti e attaccanti di giornata.' }
          ].map((widget) => (
            <div key={widget.label} className="rounded-xl border border-otc-line bg-otc-surface p-4">
              <div className="flex items-center gap-2 mb-1.5 text-otc-accent">
                <widget.icon className="h-4 w-4 strokeWidth={2}" />
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">{widget.label}</span>
              </div>
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">{widget.desc}</p>
            </div>
          ))}
        </section>

        {/* Feed delle notizie Fantacalcio filtrate */}
        {formattedNews.length === 0 ? (
          <div className="mt-12 flex justify-center">
            <EmptyState 
              title="Nessun report disponibile" 
              description="Nessun articolo marcato come Fantacalcio è presente al momento nel database di oggi."
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

      <Footer />
      <BottomNav />
    </div>
  );
}
