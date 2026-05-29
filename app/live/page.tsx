/**
 * app/live/page.tsx
 * Sezione eventi stile SofaScore.
 * Navigazione date + match LIVE in cima + Programmati + Terminati.
 */
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { MatchCard } from '@/components/match/MatchCard';
import { MatchDateNav } from '@/components/match/MatchDateNav';
import { EmptyState } from '@/components/shared/EmptyState';
import { fetchMatchesByDate } from '@/lib/sports/matches';
import type { MatchRow } from '@/lib/sports/types';

export const revalidate = 60;

export const metadata = {
  title: 'Live scores — Calcio, Basket, F1',
  description: 'Calendario partite, risultati live e classifiche.',
};

interface PageProps {
  searchParams: Promise<{ date?: string; sport?: string }>;
}

export default async function LivePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const activeDate = params.date ?? today;
  const sportFilter = params.sport;

  let matches = await fetchMatchesByDate(activeDate);
  if (sportFilter) {
    matches = matches.filter((m) => m.sport === sportFilter);
  }

  const live = matches.filter((m) => m.status === 'live');
  const scheduled = matches.filter((m) => m.status === 'scheduled');
  const finished = matches.filter((m) => m.status === 'finished');
  const postponed = matches.filter((m) => m.status === 'postponed');

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-2 flex items-baseline justify-between">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Live<span className="text-[#e8c800]">.</span>
          </h1>
          <span
            className="text-[11px] uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {matches.length} match
          </span>
        </header>

        <MatchDateNav activeDate={activeDate} />

        <SportFilter activeSport={sportFilter} activeDate={activeDate} today={today} />

        {matches.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Nessun match"
            description="Nessuna partita programmata in questa data. Prova un altro giorno."
            actionLabel="Vai a oggi"
            actionHref="/live"
          />
        ) : (
          <div className="space-y-6">
            {live.length > 0 && <MatchSection label="Live ora" emoji="🔴" matches={live} />}
            {scheduled.length > 0 && <MatchSection label="Programmati" emoji="⏰" matches={scheduled} />}
            {finished.length > 0 && <MatchSection label="Terminati" emoji="✓" matches={finished} />}
            {postponed.length > 0 && <MatchSection label="Rinviati" emoji="⏸" matches={postponed} />}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function MatchSection({ label, emoji, matches }: { label: string; emoji: string; matches: MatchRow[] }) {
  const isLive = label === 'Live ora';
  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <h2
          className="text-sm uppercase tracking-tight text-white sm:text-base"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {label}
        </h2>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
            isLive ? 'bg-red-500/15 text-red-400' : 'bg-[#1f1f1f] text-zinc-400'
          }`}
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {matches.length}
        </span>
      </header>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {matches.map((m) => <MatchCard key={m.id} match={m} />)}
      </div>
    </section>
  );
}

import Link from 'next/link';
function SportFilter({ activeSport, activeDate, today }: { activeSport?: string; activeDate: string; today: string }) {
  const base = activeDate === today ? '/live' : `/live?date=${activeDate}`;
  const withSport = (s: string) => activeDate === today ? `/live?sport=${s}` : `/live?date=${activeDate}&sport=${s}`;
  const sports = [
    { id: undefined, label: 'Tutti', emoji: '🏆' },
    { id: 'calcio', label: 'Calcio', emoji: '⚽' },
    { id: 'basket', label: 'Basket', emoji: '🏀' },
  ];
  return (
    <nav className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
      {sports.map((s) => {
        const active = s.id === activeSport;
        const href = s.id ? withSport(s.id) : base;
        return (
          <Link
            key={s.id ?? 'all'}
            href={href}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              active
                ? 'border-[#e8c800] bg-[#e8c800] text-black'
                : 'border-[#1f1f1f] bg-[#0d0d0d] text-zinc-400 hover:border-[#e8c800]/40 hover:text-[#e8c800]'
            }`}
          >
            <span className="mr-1">{s.emoji}</span>{s.label}
          </Link>
        );
      })}
    </nav>
  );
}
