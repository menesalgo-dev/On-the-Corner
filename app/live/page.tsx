/**
 * app/live/page.tsx — Live v3
 *
 * Layout:
 *  1. Breadcrumb
 *  2. Titolo + counter status (LIVE rosso, programmati gialli)
 *  3. Date strip 7 giorni
 *  4. Sport filter chips (Tutti / Calcio / Basket / Tennis / ...)
 *  5. Lista match raggruppati per competition
 *
 * Se nessun match per data selezionata, mostra suggerimenti vicini
 * (prossimo giorno con match) invece di empty state piatto.
 */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Home as HomeIcon, Radio, Calendar, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { DateStrip } from '@/components/sports/DateStrip';
import { SportTabs } from '@/components/sports/SportTabs';
import { MatchList } from '@/components/sports/MatchList';
import { fetchMatchesByDate, fetchMatchCountsByStatus } from '@/lib/sports/matches';

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ date?: string; sport?: string }>;
}

export const metadata = {
  title: 'Live — On The Corner',
  description: 'Partite e match sportivi in tempo reale.',
};

function getTodayIso(): string {
  const now = new Date();
  // Aggiungi offset Italia per il "today" giusto (UTC+1/+2)
  now.setUTCHours(now.getUTCHours() + 2);
  return now.toISOString().slice(0, 10);
}

export default async function LivePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const dateIso = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : getTodayIso();
  const sportFilter = params.sport;

  const [matches, counts] = await Promise.all([
    fetchMatchesByDate(dateIso),
    fetchMatchCountsByStatus(),
  ]);

  // Filtra per sport
  const filteredMatches = sportFilter
    ? matches.filter((m) => m.sport === sportFilter)
    : matches;

  // Lista sport disponibili nella data selezionata
  const sportsInDate = Array.from(new Set(matches.map((m) => m.sport))).sort();

  // Conteggi per status nei match della data
  const liveInDate = matches.filter((m) => m.status === 'live').length;
  const scheduledInDate = matches.filter((m) => m.status === 'scheduled').length;
  const finishedInDate = matches.filter((m) => m.status === 'finished').length;

  const isToday = dateIso === getTodayIso();

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-otc-accent"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span
            className="uppercase tracking-widest text-zinc-300"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Live
          </span>
        </nav>

        {/* Titolo + status counters */}
        <header className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1
              className="text-3xl uppercase tracking-tight text-white sm:text-5xl"
              style={{ fontFamily: 'var(--font-archivo-black)', letterSpacing: '-0.02em' }}
            >
              Live<span className="text-otc-accent">.</span>
            </h1>
            <p
              className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {isToday ? 'Oggi' : `Calendario ${dateIso}`}
            </p>
          </div>

          {/* Status pills */}
          <div className="flex gap-1.5">
            {liveInDate > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-red-400"
                style={{ fontFamily: 'var(--font-dm-mono)' }}>
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {liveInDate} live
              </span>
            )}
            {scheduledInDate > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-otc-accent/30 bg-otc-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-otc-accent"
                style={{ fontFamily: 'var(--font-dm-mono)' }}>
                {scheduledInDate} prog
              </span>
            )}
            {finishedInDate > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-otc-line bg-otc-surface px-2.5 py-1 text-[10px] uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-dm-mono)' }}>
                {finishedInDate} fin
              </span>
            )}
          </div>
        </header>

        {/* Date strip 7 giorni */}
        <DateStrip activeDate={dateIso} />

        {/* Sport tabs (solo se ci sono match nella data) */}
        {sportsInDate.length > 1 && (
          <SportTabs activeSport={sportFilter} sports={sportsInDate} date={dateIso} />
        )}

        {/* Lista match o empty intelligent */}
        {filteredMatches.length === 0 ? (
          <EmptyMatches dateIso={dateIso} sportFilter={sportFilter} />
        ) : (
          <MatchList matches={filteredMatches} />
        )}
      </main>

      <Footer />
      <BottomNav liveCount={counts.live} />
    </>
  );
}

/* ============================================================
 * Empty intelligente
 * ============================================================ */
function EmptyMatches({ dateIso, sportFilter }: { dateIso: string; sportFilter?: string }) {
  const isToday = dateIso === getTodayIso();

  return (
    <div className="mt-6 rounded-2xl border border-otc-line bg-otc-surface p-8 text-center sm:p-12">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-otc-accent/10">
        <Calendar className="h-6 w-6 text-otc-accent" />
      </div>
      <h2
        className="text-lg uppercase tracking-tight text-white sm:text-xl"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {sportFilter ? `Nessun match di ${sportFilter}` : 'Nessun match'}
      </h2>
      <p className="mt-2 text-sm text-zinc-400">
        {isToday
          ? 'Oggi non ci sono partite in calendario. Controlla i prossimi giorni.'
          : 'Per questa data non ci sono partite. Prova un altro giorno.'}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {sportFilter && (
          <Link
            href={`/live?date=${dateIso}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-otc-line bg-otc-bg px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 transition hover:border-otc-accent/40 hover:text-otc-accent"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Tutti gli sport
          </Link>
        )}
        <Link
          href={`/live?date=${nextDay(dateIso)}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-otc-accent px-4 py-2 text-xs uppercase tracking-wider text-black"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          → Vedi domani
        </Link>
      </div>
    </div>
  );
}

function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}
