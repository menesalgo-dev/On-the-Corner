/**
 * app/live/page.tsx
 * Live Tracker Hub - Versione Sofascore Compatta.
 * Interamente connesso al flusso reale di Supabase con aggiornamenti dinamici.
 */
import React from 'react';
import { Radio, Activity, Clock, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes, supabaseServer } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const dynamic = 'force-dynamic';
export const revalidate = 15; // Cache brevissima di 15 secondi per simulare il tempo reale di Sofascore

export default async function LivePage() {
  // Recupero parallelo dal database di tutti i match reali del palinsesto odierno
  const [liveMatchesResult, rawNews, bookmarkHashes] = await Promise.all([
    supabaseServer
      .from('live_matches')
      .select('*')
      .order('event_status', { ascending: true }) // Mette i match 'live' in cima
      .order('updated_at', { ascending: false }),
    fetchLatestNews({ limit: 4 }),
    fetchUserBookmarkHashes(),
  ]);

  const liveMatches = liveMatchesResult.data || [];
  const latestNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // Raggruppamento automatico per Competizione/Lega (Esattamente come fa Sofascore)
  const matchesByLeague: Record<string, any[]> = {};
  liveMatches.forEach((match) => {
    const leagueKey = match.league || 'Altri Eventi';
    if (!matchesByLeague[leagueKey]) {
      matchesByLeague[leagueKey] = [];
    }
    matchesByLeague[leagueKey].push(match);
  });

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <Header />

      <main className="mx-auto max-w-[1200px] px-5 py-8 md:py-10">
        
        {/* Intestazione Sofascore Tracker */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-otc-line">
          <div>
            <h1 
              className="text-lg font-bold uppercase tracking-widest text-zinc-250 font-mono flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-pulse-dot" />
              Diretta Risultati<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Palinsesto sportivo globale aggiornato al minuto.</p>
          </div>
          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-2 sm:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded">
            {liveMatches.length} Match in tabellone
          </div>
        </header>

        {/* 🛠️ CASO VUOTO: Se non ci sono partite registrate nella giornata */}
        {liveMatches.length === 0 ? (
          <div className="rounded-xl border border-otc-line bg-otc-surface p-8 text-center max-w-xl mx-auto my-12">
            <Radio className="h-6 w-6 text-zinc-600 mx-auto mb-3 animate-pulse-dot" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Nessun match in corso</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Nessun evento attivo registrato su Supabase. Richiama l&apos;URL di sincronizzazione per caricare le partite odierne di Football-Data.
            </p>
          </div>
        ) : (
          /* 🛠️ CASO POPOLATO: Struttura a Blocchi di Lega in stile Sofascore */
          <div className="space-y-6 mb-12">
            {Object.entries(matchesByLeague).map(([leagueName, items]) => (
              <div key={leagueName} className="rounded-xl border border-otc-line bg-[#070709] overflow-hidden">
                
                {/* Intestazione della Competizione */}
                <div className="bg-otc-surface px-4 py-2 border-b border-otc-line text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex justify-between items-center">
                  <span>🏆 {leagueName}</span>
                  <span className="text-[9px] text-zinc-600 font-normal">{items[0]?.sport}</span>
                </div>

                {/* Lista dei match all&apos;interno della competizione */}
                <div className="divide-y divide-otc-line/40">
                  {items.map((match) => {
                    const isLive = match.event_status === 'live';
                    const isFinished = match.event_status === 'finished';

                    return (
                      <div key={match.id} className="group p-4 flex items-center gap-4 bg-otc-bg transition hover:bg-otc-surface/20">
                        
                        {/* Indicatore Temporale / Minuto Sofascore */}
                        <div className="w-14 shrink-0 text-center flex flex-col items-center justify-center font-mono">
                          {isLive ? (
                            <span className="text-[10px] font-bold text-red-400 inline-flex items-center gap-0.5 animate-pulse-dot">
                              <Activity className="h-3 w-3" />
                              {match.match_minute}&apos;
                            </span>
                          ) : isFinished ? (
                            <span className="text-[9px] text-zinc-600 uppercase font-semibold">Fin</span>
                          ) : (
                            <span className="text-[10px] text-otc-accent font-bold inline-flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {match.match_minute}
                            </span>
                          )}
                        </div>

                        {/* Nomi delle Squadre (Incolonnate) */}
                        <div className="flex-1 space-y-1.5 border-l border-otc-line/60 pl-4">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs tracking-tight ${isFinished && Number(match.home_score) < Number(match.away_score) ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                              {match.home_team}
                            </span>
                            <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isLive ? 'text-red-400 bg-red-500/5' : 'text-zinc-300'}`}>
                              {match.home_score}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs tracking-tight ${isFinished && Number(match.away_score) < Number(match.home_score) ? 'text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                              {match.away_team}
                            </span>
                            <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isLive ? 'text-red-400 bg-red-500/5' : 'text-zinc-300'}`}>
                              {match.away_score}
                            </span>
                          </div>
                        </div>

                        {/* Azione di espansione (Freccia a destra discreta) */}
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FEED NEWS INFERIORE */}
        <section className="border-t border-zinc-900 pt-8">
          <h2 className="mb-5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">// Report e Approfondimenti Recenti</h2>
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
