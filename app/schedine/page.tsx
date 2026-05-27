/**
 * app/schedine/page.tsx
 * Schedine Hub & Bet Tracker - Gestione e tracciamento delle bollette virtuali.
 * Interamente connesso alle tabelle di Supabase e allineato ai token otc.
 */
import React from 'react';
import { Ticket, Clock, CheckCircle2, XCircle, DollarSign, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabaseServer } from '@/lib/news';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Schedine Tracker — Gestione Bollette On The Corner',
  description: 'Tieni traccia delle tue schedine sportive e analizza i rendimenti in tempo reale.',
};

export default async function SchedinePage() {
  let userId: string | null = null;
  let savedBets: any[] = [];

  try {
    const supabaseAuth = await createClient();
    const { data: authData } = await supabaseAuth.auth.getUser();
    userId = authData.user?.id ?? null;

    if (userId) {
      // Estrae le schedine dell'utente includendo le singole selezioni e i dati dei match reali
      const { data } = await supabaseServer
        .from('user_bets')
        .select(`
          *,
          user_bet_selections (
            *,
            live_matches (home_team, away_team, home_score, away_score, event_status)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      savedBets = data || [];
    }
  } catch (err) {
    console.error('❌ Errore nel caricamento del Bet Tracker:', err);
  }

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <Header />

      <main className="mx-auto max-w-[1000px] px-6 py-8 md:py-12">
        
        {/* Intestazione Schedine Hub */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-otc-line">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <Ticket className="h-3.5 w-3.5 text-otc-accent" />
              Bet Management System
            </div>
            <h1 
              className="text-xl font-bold uppercase tracking-widest text-zinc-200 font-mono"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Archivio Schedine<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Inserisci i tuoi pronostici esterni e tieni traccia degli esiti in base ai risultati reali.
            </p>
          </div>

          <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase mt-3 sm:mt-0 bg-otc-surface border border-otc-line px-2.5 py-1 rounded">
            {savedBets.length} Schedine registrate
          </div>
        </header>

        {/* 🛠️ CASO NON AUTENTICATO O ARCHIVIO VUOTO */}
        {!userId ? (
          <div className="rounded-xl border border-otc-line bg-otc-surface p-8 text-center max-w-md mx-auto my-12">
            <User className="h-6 w-6 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Accesso richiesto</h3>
            <p className="text-xs text-zinc-500 mt-1">Esegui l&apos;accesso per poter comporre, salvare e monitorare le tue schedine personali.</p>
          </div>
        ) : savedBets.length === 0 ? (
          <div className="rounded-xl border border-otc-line bg-otc-surface p-8 text-center max-w-md mx-auto my-12">
            <Ticket className="h-6 w-6 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Nessuna schedina in archivio</h3>
            <p className="text-xs text-zinc-500 mt-1">Componi la tua prima giocata partendo dal palinsesto dei Live scores o aggiungi un report manuale.</p>
          </div>
        ) : (
          /* 🛠️ ELENCO DELLE SCHEDINE ATTIVE (BET CARDS) */
          <div className="space-y-6">
            {savedBets.map((bet) => {
              const potentialWinCents = Math.round(bet.stake_cents * Number(bet.total_odds));
              const isOpen = bet.status === 'open';
              const isWon = bet.status === 'won';

              return (
                <div key={bet.id} className="rounded-xl border border-otc-line bg-otc-surface overflow-hidden transition-colors hover:border-zinc-800">
                  {/* Intestazione Bolletta */}
                  <div className="bg-[#0b0b0d] px-4 py-3 border-b border-otc-line flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <span className="text-amber-400 inline-flex items-center gap-1"><Clock className="h-3 w-3 animate-pulse-dot" /> In corso</span>
                      ) : isWon ? (
                        <span className="text-green-400 inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Vincente</span>
                      ) : (
                        <span className="text-red-400 inline-flex items-center gap-1"><XCircle className="h-3 w-3" /> Perdente</span>
                      )}
                    </div>
                    <span className="text-zinc-600">ID: #{bet.id.substring(0,8)}</span>
                  </div>

                  {/* Elenco Selezioni Interne */}
                  <div className="divide-y divide-otc-line/40 bg-otc-bg/30">
                    {bet.user_bet_selections?.map((sel: any) => {
                      const match = sel.live_matches;
                      return (
                        <div key={sel.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold text-zinc-200">
                              {match ? `${match.home_team} - ${match.away_team}` : 'Incontro rimosso'}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                              Segno giocato: <span className="text-otc-accent font-bold">{sel.prediction}</span> • Quota: @{Number(sel.odds).toFixed(2)}
                            </p>
                          </div>
                          {match && match.event_status !== 'scheduled' && (
                            <span className="font-mono text-[11px] font-bold text-zinc-400 bg-otc-line px-2 py-0.5 rounded">
                              {match.home_score}–{match.away_score}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Resoconto Finanziario Inferiore */}
                  <div className="bg-[#050507] px-4 py-3 border-t border-otc-line grid grid-cols-3 gap-2 text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <div>
                      <p className="text-[8px] text-zinc-600">Importo</p>
                      <p className="text-zinc-300 font-bold mt-0.5">{formatCurrency(bet.stake_cents)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-600">Quota Totale</p>
                      <p className="text-zinc-300 font-bold mt-0.5">x{Number(bet.total_odds).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-zinc-600">Potenziale Vincita</p>
                      <p className={`font-bold mt-0.5 ${isWon ? 'text-green-400' : 'text-otc-accent'}`}>
                        {formatCurrency(potentialWinCents)}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

// Micro-Componente interno di fallback se l'utente non è loggato su Supabase Auth
function User({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
}
