/**
 * app/live/[matchId]/page.tsx
 * Dettaglio match con score grande + bottone "Aggiungi a schedina".
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { fetchMatchById } from '@/lib/sports/matches';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 30;

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;
  const m = await fetchMatchById(matchId);
  if (!m) return { title: 'Match non trovato' };
  return { title: `${m.home_team} vs ${m.away_team}` };
}

const SPORT_EMOJI: Record<string, string> = { calcio: '⚽', basket: '🏀' };

function formatStart(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome',
  });
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { matchId } = await params;
  const m = await fetchMatchById(matchId);
  if (!m) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const isLive = m.status === 'live';
  const isFinished = m.status === 'finished';
  const emoji = SPORT_EMOJI[m.sport] ?? '🏆';

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[800px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <Link
          href="/live"
          className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Indietro
        </Link>

        <article className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-6 sm:p-8">
          {/* Meta */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-center">
            <span className="text-2xl">{emoji}</span>
            {m.competition && (
              <span
                className="text-[11px] uppercase tracking-widest text-zinc-400"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {m.competition}
              </span>
            )}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
                LIVE {m.minute ?? ''}
              </span>
            )}
            {isFinished && (
              <span className="rounded-md bg-zinc-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                Terminata
              </span>
            )}
          </div>

          {/* Score */}
          <div className="grid grid-cols-3 items-center gap-4 py-6">
            <Team name={m.home_team} side="home" />
            <Score m={m} />
            <Team name={m.away_team} side="away" />
          </div>

          {/* Info */}
          <div className="mt-2 border-t border-[#1f1f1f] pt-4 text-center text-xs text-zinc-400">
            {formatStart(m.start_time)}
            {m.venue && <span className="block mt-1 text-zinc-500">{m.venue}</span>}
          </div>
        </article>

        {/* Schedina */}
        <section className="mt-6">
          {isLoggedIn ? (
            <div className="rounded-2xl border border-[#e8c800]/30 bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-5">
              <h2
                className="text-sm uppercase tracking-tight text-[#e8c800]"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                🎯 Aggiungi a schedina
              </h2>
              <p className="mt-2 text-xs text-zinc-400">
                La funzione schedine sarà disponibile nella prossima release (W5).
                Qui potrai aggiungere pronostici 1X2, Over/Under, GG/NG su questa partita.
              </p>
              <button
                disabled
                className="mt-4 cursor-not-allowed rounded-xl bg-zinc-700 px-5 py-3 text-sm uppercase tracking-wider text-zinc-400"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                In arrivo
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 text-center">
              <p className="text-sm text-zinc-400">
                Accedi per aggiungere questa partita alle tue schedine.
              </p>
              <Link
                href="/login"
                className="mt-3 inline-block rounded-xl bg-[#e8c800] px-5 py-2 text-xs uppercase tracking-wider text-black transition hover:scale-[1.02]"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Accedi
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function Team({ name, side }: { name: string; side: 'home' | 'away' }) {
  return (
    <div className={`flex flex-col items-center ${side === 'home' ? 'sm:items-end' : 'sm:items-start'}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#141414] text-2xl">
        ⚽
      </div>
      <span
        className="mt-3 text-center text-sm uppercase tracking-tight text-white sm:text-base"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {name}
      </span>
    </div>
  );
}

function Score({ m }: { m: { home_score: number | null; away_score: number | null; status: string; minute: string | null; start_time: string } }) {
  const hasScore = m.home_score !== null && m.away_score !== null;
  if (hasScore) {
    return (
      <div className="text-center">
        <div className="text-5xl tabular-nums text-white sm:text-7xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          {m.home_score} – {m.away_score}
        </div>
        {m.minute && (
          <div className="mt-2 text-xs uppercase tracking-widest text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {m.minute}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="text-center">
      <div className="text-4xl tabular-nums text-zinc-500 sm:text-5xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>
        {new Date(m.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome' })}
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-widest text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
        VS
      </div>
    </div>
  );
}
