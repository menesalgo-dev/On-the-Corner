/**
 * components/layout/LiveStrip.tsx
 * Versione ottimizzata per snake_case dal database
 */
import React from 'react';
import Link from 'next/link';
import { Radio } from 'lucide-react';

interface LiveMatch {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  status: 'live' | 'scheduled' | 'finished';
}

interface Props {
  matches?: any[];   // Accetta qualsiasi formato (snake_case o camelCase)
}

export function LiveStrip({ matches = [] }: Props) {
  
  // Normalizzazione leggera per snake_case
  const normalized = matches.map((m: any) => ({
    id: m.id,
    sport: m.sport || m.sport_type || 'calcio',
    homeTeam: m.home_team || m.homeTeam || 'Squadra',
    awayTeam: m.away_team || m.awayTeam,
    homeScore: m.home_score !== undefined ? m.home_score : m.homeScore,
    awayScore: m.away_score !== undefined ? m.away_score : m.awayScore,
    minute: m.minute || m.current_minute,
    status: m.status || 'live',
  }));

  if (normalized.length === 0) {
    return (
      <section className="rounded-xl border border-otc-line bg-otc-surface p-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-dot" />
          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
            Live ora
          </span>
          <span className="ml-auto text-xs text-zinc-500 tracking-tight">
            Match live in arrivo nelle prossime settimane
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-otc-line bg-otc-surface">
      <header className="flex items-center justify-between border-b border-otc-line px-4 py-2 bg-otc-bg/40">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse-dot" />
          <span className="text-[10px] uppercase tracking-widest text-zinc-200 font-bold">
            Live ora
          </span>
          <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-red-400">
            {normalized.length}
          </span>
        </div>
        <Link
          href="/live"
          className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 transition hover:text-otc-accent"
        >
          Vedi Tutti →
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto p-2.5 scrollbar-none bg-[#050507]">
        {normalized.map((m) => (
          <Link
            key={m.id}
            href={`/live/${m.id}`}
            className="flex shrink-0 items-center gap-3 rounded-lg border border-otc-line bg-otc-surface px-3 py-1.5 transition hover:border-otc-accent/30"
          >
            <span className="rounded bg-otc-accent/10 px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-otc-accent">
              {m.sport}
            </span>
            <span className="text-xs text-zinc-200 font-medium tracking-tight">{m.homeTeam}</span>
            
            {m.homeScore !== undefined && (
              <span className="font-mono text-xs font-bold text-zinc-100 bg-otc-line px-1.5 py-0.5 rounded">
                {m.homeScore}–{m.awayScore}
              </span>
            )}
            
            {m.awayTeam && (
              <span className="text-xs text-zinc-200 font-medium tracking-tight">{m.awayTeam}</span>
            )}
            
            {m.minute && (
              <span className="text-[10px] font-mono text-otc-accent font-semibold animate-pulse-dot">
