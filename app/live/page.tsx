/**
 * app/live/page.tsx
 * Live Tracker Hub - Centrale Operativa degli Eventi Sportivi in Tempo Reale.
 * Diviso per evento/disciplina, integrato con la palette otc ed estetica Premium Minimal.
 */
import React from 'react';
import { Radio, ChevronRight, Activity, Trophy, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 60; // Refresh rapido ogni minuto per catturare la recency dei match

export const metadata = {
  title: 'Diretta Risultati — On The Corner Live Hub',
  description: 'Punteggi in tempo reale, classifiche e cronologia eventi divisi per sport.',
};

// Struttura dati simulata ad altissima fedeltà divisa per singoli eventi e discipline
const LIVE_EVENTS = {
  calcio: [
    { id: 'c1', league: 'Serie A', home: 'Inter', away: 'Juventus', homeScore: 2, awayScore: 1, info: '74\'', detail: 'Gol: Lautaro 24\', Barella 61\' - Vlahovic 41\'' },
    { id: 'c2', league: 'Champions League', home: 'Milan', away: 'Real Madrid', homeScore: 0, awayScore: 0, info: '12\'', detail: 'Fase a gironi - San Siro' }
  ],
  motori: [
    { id: 'm1', championship: 'Formula 1', event: 'GP Monaco', leader: 'Leclerc (FER)', chaser: 'Verstappen (RED)', gap: '+1.245s', info: 'Giro 52/78', type: 'f1' },
    { id: 'm2', championship: 'MotoGP', event: 'GP Mugello', leader: 'Bagnaia (DUC)', chaser: 'Martin (PRA)', gap: '+0.412s', info: 'Giro 14/23', type: 'motogp' }
  ],
  tennis: [
    { id: 't1', tournament: 'Roland Garros', p1: 'Sinner J.', p2: 'Alcaraz C.', score: '6-4, 3-6, 6-2, 4-3', info: 'Set 4 - In corso' }
  ]
};

export default async function LivePage() {
  // Recupero parallelo delle notizie e dei preferiti ad hash per la sezione inferiore
  const [rawNews, bookmarkHashes] = await Promise.all([
    fetchLatestNews({ limit: 4 }),
    fetchUserBookmarkHashes(),
  ]);

  const latestNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  return (
    <div className="min-h-screen bg-otc-bg text-zinc-100 selection:bg-otc-accent/10 selection:text-otc-accent-2">
      <Header />

      <main className="mx-auto max-w-[1340px] px-6 py-8 md:py-12">
        
        {/* Intestazione Editoriale ad Alta Densità */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-5 border-b border-otc-line">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-dot" />
              Diretta Flussi API Attiva
            </div>
            <h1 
              className="text-xl font-bold uppercase tracking-widest text-zinc-200 font-mono"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Live Tracker<span className="text-otc-accent">.</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
              Centrale operativa dei risultati in tempo reale divisi per evento e telemetria.
            </p>
          </div>

          {/* Filtro di Stato Rapido Minimalista */}
          <div className="flex gap-1 mt-4 md:mt-0 bg-[#050507] border border-otc-line p-1 rounded-lg">
            {['In Corso', 'Programmati', 'Terminati'].map((status, idx) => (
              <button 
                key={status} 
                className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                  idx === 0 ? 'bg-otc-line text-otc-accent' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </header>

        {/* ⚽ SEZIONE 1: CALCIO (SCOREBOARD TRADIZIONALE ED EVENTI MARCATORE) */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">⚽ Calcio (Serie A & Co.)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIVE_EVENTS.calcio.map((match) => (
              <div key={match.id} className="group rounded-xl border border-otc-line bg-otc-surface p-4 transition hover:border-zinc-700/60">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
                  <span>{match.league}</span>
                  <span className="text-red-400 font-bold inline-flex items-center gap-1 animate-pulse-dot">
                    <Activity className="h-3 w-3" /> {match.info}
                  </span>
                </div>
                <div className="space-y-2 my-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{match.home}</span>
                    <span className="font-mono text-xs font-bold bg-otc-line px-2 py-0.5 rounded border border-zinc-800/40">{match.homeScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">{match.away}</span>
                    <span className="font-mono text-xs font-bold bg-otc-line px-2 py-0.5 rounded border border-zinc-800/40">{match.awayScore}</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono mt-3 border-t border-zinc-900/50 pt-2">{match.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🏎️ SEZIONE 2: MOTORI (TELEMETRIA F1 & MOTOGP - LEADER/DISTACCO) */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">🏎️ Motori (F1 & MotoGP)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIVE_EVENTS.motori.map((race) => (
              <div key={race.id} className="group rounded-xl border border-otc-line bg-otc-surface p-4 transition hover:border-zinc-700/60">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
                  <span>{race.championship} • {race.event}</span>
                  <span className="text-otc-accent font-bold inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {race.info}
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs my-2">
                  <div className="flex justify-between bg-otc-bg p-2 rounded border border-zinc-900">
                    <span className="text-zinc-400">P1 {race.leader}</span>
                    <span className="text-zinc-500">Leader</span>
                  </div>
                  <div className="flex justify-between bg-otc-bg p-2 rounded border border-zinc-900">
                    <span className="text-zinc-300">P2 {race.chaser}</span>
                    <span className="text-otc-accent font-bold">{race.gap}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 🎾 SEZIONE 3: TENNIS (PUNTEGGIO SET COMPLETO CORRENTE) */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">🎾 Tennis (ATP & WTA)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LIVE_EVENTS.tennis.map((ten) => (
              <div key={ten.id} className="group rounded-xl border border-otc-line bg-otc-surface p-4 transition hover:border-zinc-700/60">
                <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-3">
                  <span>{ten.tournament}</span>
                  <span className="text-red-400 font-bold inline-flex items-center gap-1 animate-pulse-dot">
                    <Activity className="h-3 w-3" /> {ten.info}
                  </span>
                </div>
                <div className="p-3 bg-otc-bg rounded border border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 my-2">
                  <div className="text-xs font-semibold text-zinc-200">
                    {ten.p1} <span className="text-zinc-500 font-normal">vs</span> {ten.p2}
                  </div>
                  <div className="font-mono text-xs font-black tracking-wider text-otc-accent bg-otc-line px-2 py-1 rounded">
                    {ten.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOX SPECIFICHE API MILTONE 4 */}
        <section className="mb-12 overflow-hidden rounded-xl border border-otc-line bg-gradient-to-br from-otc-surface to-[#120f03]/30 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500 animate-pulse-dot">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
