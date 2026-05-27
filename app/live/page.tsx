/**
 * app/live/page.tsx
 * Live Tracker Hub - Versione Sofascore Timeline Completa.
 * Mostra match passati, presenti e futuri ordinati cronologicamente con auto-trigger su visita.
 */
import React from 'react';
import { Radio, Activity, Clock, ChevronRight, CalendarCheck } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes, supabaseServer } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LivePage() {
  // ⚡ AUTOMATIC TRIGGER ON VISIT (REFRESH DEGLI EVENTI OGNI 60 SECONDI)
  try {
    const { data: lastUpdatedMatch } = await supabaseServer
      .from('live_matches')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().getTime();
    const lastSync = lastUpdatedMatch?.updated_at ? new Date(lastUpdatedMatch.updated_at).getTime() : 0;

    if (now - lastSync > 60000) {
      const host = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      fetch(`${host}/api/manual-sync/live?secret=${process.env.CRON_SECRET}`, {
        next: { revalidate: 0 }
      }).catch(err => console.error("⚠️ Refresh ignorato:", err.message));
    }
  } catch (syncErr: any) {
    console.error("⚠️ Sincronizzazione fallita:", syncErr.message);
  }

  // Estrazione universale di TUTTI i match della timeline dal DB
  const [liveMatchesResult, rawNews, bookmarkHashes] = await Promise.all([
    supabaseServer
      .from('live_matches')
      .select('*')
      .order('match_minute', { ascending: true }), // Ordina cronologicamente per orario/minuto
    fetchLatestNews({ limit: 4 }),
    fetchUserBookmarkHashes(),
  ]);

  const liveMatches = liveMatchesResult.data || [];
  const latestNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  // Raggruppamento Sofascore per Competizione/Lega
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
        
        {/* Intestazione Timeline */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-otc-line">
          <div>
            <h1 
              className="text-lg font-bold uppercase tracking-widest text-zinc-200 font-mono flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-otc-accent animate-pulse-dot" />
              Timeline Palinsesto<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">Risultati terminati, match in corso e incontri in programma oggi e nei prossimi giorni.</p>
          </div>
          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-2 sm:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded">
            {liveMatches.length} Eventi Totali
          </div>
        </header>

        {liveMatches.length === 0 ? (
          <div className="rounded-xl border border-otc-line bg-otc-surface p-8 text-center max-w-xl mx-auto my-12">
            <CalendarCheck className="h-6 w-6 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Nessun match programmato</h3>
            <p className="text-xs text-zinc-500 mt-1">Il database si aggiornerà non appena l&apos;API distribuirà i nuovi blocchi di calendario.</p>
          </div>
        ) : (
          /* Blocchi per competizione */
          <div className="space-y-6 mb-12">
            {Object.entries(matchesByLeague).map(([leagueName, items]) => (
              <div key={leagueName} className="rounded-xl border border-otc-line bg-[#070709] overflow-hidden">
                
                <div className="bg-otc-surface px-4 py-2 border-b border-otc-line text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex justify-between items-center">
                  <span>🏆 {leagueName}</span>
                  <span className="text-[9px] text-zinc-600 font-normal">Calcio</span>
                </div>

                <div className="divide-y divide-otc-line/40">
                  {items.map((match) => {
                    const isLive = match.event_status === 'live';
                    const isFinished = match.event_status === 'finished';
                    const isScheduled = match.event_status === 'scheduled';

                    return (
                      <div key={match.id} className="group p-4 flex items-center gap-4 bg-otc-bg transition hover:bg-otc-surface/20">
                        
                        {/* Gestione dinamica degli stati temporali della Timeline */}
                        <div className="w-14 shrink-0 text-center flex flex-col items-center justify-center font-mono">
                          {isLive ? (
                            <span className="text-[10px] font-bold text-red-400 inline-flex items-center gap-0.5 animate-pulse-dot">
                              <Activity className="h-3 w-3" />
                              {match.match_minute}&apos;
                            </span>
                          ) : isFinished ? (
                            <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-500 uppercase font-bold border border-zinc-800/40">Fin</span>
                          ) : (
                            // Se il match è futuro, mostra l'orario di inizio (es: 20:45) o la data salvata
                            <span className="text-[10px] text-zinc-400 font-bold inline-flex items-center gap-0.5 bg-otc-line/40 px-1.5 py-0.5 rounded">
                              <Clock className="h-3 w-3 text-otc-accent" />
                              {match.match_minute || 'FT'}
                            </span>
                          )}
                        </div>

                        {/* Squadre e Punteggio */}
                        <div className="flex-1 space-y-1.5 border-l border-otc-line/60 pl-4">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs tracking-tight ${isFinished && Number(match.home_score) < Number(match.away_score) ? 'text-zinc-500 line-through decoration-zinc-800' : 'text-zinc-200 group-hover:text-white'}`}>
                              {match.home_team}
                            </span>
                            {!isScheduled && (
                              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isLive ? 'text-red-400 bg-red-500/5' : 'text-zinc-400'}`}>
                                {match.home_score}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs tracking-tight ${isFinished && Number(match.away_score) < Number(match.home_score) ? 'text-zinc-500 line-through decoration-zinc-800' : 'text-zinc-200 group-hover:text-white'}`}>
                              {match.away_team}
                            </span>
                            {!isScheduled && (
                              <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${isLive ? 'text-red-400 bg-red-500/5' : 'text-zinc-400'}`}>
                                {match.away_score}
                              </span>
                            )}
                          </div>
                        </div>

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
