/**
 * app/live/page.tsx
 * Live Tracker Hub - Centrale Operativa Dinamica Multi-Sport.
 * Carica in tempo reale tutti gli eventi presenti nel DB dividendoli per disciplina.
 */
import React from 'react';
import { Radio, Activity, Trophy, Clock, Layers } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes, supabaseServer } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const dynamic = 'force-dynamic';
export const revalidate = 30; // Aggiornamento rapido ogni 30 secondi per la massima reattività

export const metadata = {
  title: 'Diretta Risultati Universale — On The Corner Live',
  description: 'Tutti gli eventi sportivi della giornata in tempo reale divisi per disciplina.',
};

export default async function LivePage() {
  // 1. RECUPERO IN PARALLELO: Tutti i match reali dal DB + Ultime news + Preferiti ad hash
  const [liveMatchesResult, rawNews, bookmarkHashes] = await Promise.all([
    supabaseServer
      .from('live_matches')
      .select('*')
      .order('sport', { ascending: true })
      .order('updated_at', { ascending: false }),
    fetchLatestNews({ limit: 4 }),
    fetchUserBookmarkHashes(),
  ]);

  const liveMatches = liveMatchesResult.data || [];
  const latestNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // 2. RAGGRUPPAMENTO DINAMICO: Divide automaticamente i match per sport (Calcio, F1, Tennis, ecc.)
  // Gestisce infiniti eventi e nuove discipline senza bisogno di modificare il codice in futuro
  const matchesBySport: Record<string, any[]> = {};
  liveMatches.forEach((match) => {
    const sportKey = match.sport ? match.sport.toLowerCase() : 'altri sport';
    if (!matchesBySport[sportKey]) {
      matchesBySport[sportKey] = [];
    }
    matchesBySport[sportKey].push(match);
  });

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <Header />

      <main className="mx-auto max-w-[1340px] px-6 py-8 md:py-12">
        
        {/* Intestazione della Centrale Operativa */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-5 border-b border-otc-line">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-dot" />
              Flusso Streaming live Attivo
            </div>
            <h1 
              className="text-xl font-bold uppercase tracking-widest text-zinc-200 font-mono"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tutti gli Eventi<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
              Tabellone universale dei punteggi. I dati si aggiornano da soli includendo ogni match della giornata.
            </p>
          </div>

          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-3 md:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded-md">
            {liveMatches.length} Eventi Attivi
          </div>
        </header>

        {/* 🛠️ CONDIZIONE 1: SE IL DATABASE È VUOTO (Placeholder Premium Informativo) */}
        {liveMatches.length === 0 ? (
          <section className="mb-12 overflow-hidden rounded-xl border border-otc-line bg-gradient-to-br from-otc-surface to-[#120f03]/20 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 animate-pulse-dot">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
                  Nessun evento in corso in questo momento
                </h3>
                <p className="mt-2 max-w-3xl text-xs text-zinc-400 leading-relaxed font-normal">
                  Il tabellone è vuoto perché non ci sono partite o sessioni attive sul palinsesto attuale. Lo scraper automatico è connesso agli endpoint stabili di <span className="text-zinc-300 font-medium">Football-Data.org</span> e <span className="text-zinc-300 font-medium">Jolpica API</span>: non appena inizieranno i primi match della giornata, i punteggi e i minuti di gioco appariranno qui automaticamente divisi per categoria.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* 🛠️ CONDIZIONE 2: STAMPA AUTOMATICA DI TUTTI GLI EVENTI DIVISI PER SPORT */
          <div className="space-y-10 mb-12">
            {Object.entries(matchesBySport).map(([sportName, items]) => (
              <section key={sportName} className="animate-fadeIn">
                {/* Intestazione Dinamica dello Sport */}
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold capitalize">
                    📊 {sportName} ({items.length})
                  </span>
                </div>

                {/* Griglia Liquida dei Match dello sport corrente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((match) => (
                    <div 
                      key={match.id} 
                      className="group rounded-xl border border-otc-line bg-otc-surface p-4 transition duration-200 hover:border-zinc-700/60"
                    >
                      <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
                        <span>{match.league || 'Competizione'}</span>
                        <span className="text-red-400 font-bold inline-flex items-center gap-1 animate-pulse-dot">
                          <Activity className="h-3 w-3" /> {match.match_minute || 'Live'}&apos;
                        </span>
                      </div>
                      
                      {/* Scoreboard Flessibile (Funziona sia per Calcio che per Tennis/Motori) */}
                      <div className="space-y-2 my-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                            {match.home_team}
                          </span>
                          <span className="font-mono text-xs font-bold bg-otc-line px-2 py-0.5 rounded border border-zinc-800/40">
                            {match.home_score}
                          </span>
                        </div>
                        {match.away_team && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                              {match.away_team}
                            </span>
                            <span className="font-mono text-xs font-bold bg-otc-line px-2 py-0.5 rounded border border-zinc-800/40">
                              {match.away_score}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dettagli Marcatore o Telemetria estratti dal JSON */}
                      {match.live_details && (
                        <p className="text-[10px] text-zinc-500 font-mono mt-3 border-t border-zinc-900/50 pt-2">
                          {match.live_details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* GRIGLIA NEWS SPORTIVE CORRELATE INFERIORI */}
        <section className="border-t border-zinc-900 pt-8">
          <h2 
            className="mb-5 text-sm font-mono uppercase tracking-widest text-zinc-400"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            // Analisi e Report dell&apos;Ultim&apos;Ora
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {latestNews.map((item) => (
              <NewsCard key={item.id} news={item} isBookmarked={bookmarkHashes.has(item.id)} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
