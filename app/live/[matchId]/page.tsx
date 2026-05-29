/**
 * app/live/[matchId]/page.tsx
 * Dettaglio singolo match con score grande, info competizione,
 * pulsante "Aggiungi a schedina" (placeholder W5).
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Trophy, Ticket } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { fetchMatchById } from '@/lib/sports/matches'
import { createClient } from '@/lib/supabase/server'
import type { MatchRow } from '@/lib/sports/types'

export const revalidate = 30

interface PageProps {
  params: Promise<{ matchId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params
  const m = await fetchMatchById(matchId)
  if (!m) return { title: 'Match non trovato' }
  return {
    title: `${m.home_team} – ${m.away_team}`,
    description: `${m.competition ?? 'Sport'}: ${m.home_team} vs ${m.away_team}`,
  }
}

const SPORT_EMOJI: Record<string, string> = { calcio: '⚽', basket: '🏀', tennis: '🎾' }

function formatStart(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome',
  })
}

export default async function MatchDetailPage({ params }: PageProps) {
  const { matchId } = await params
  const m = await fetchMatchById(matchId)
  if (!m) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  const isLive = m.status === 'live'
  const isFinished = m.status === 'finished'
  const isPostponed = m.status === 'postponed'
  const isScheduled = m.status === 'scheduled'
  const emoji = SPORT_EMOJI[m.sport] ?? '🏆'

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[800px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        {/* Back link */}
        <Link
          href="/live"
          className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Calendario
        </Link>

        {/* Card principale */}
        <article className="overflow-hidden rounded-3xl border border-[#1f1f1f] bg-gradient-to-b from-[#0d0d0d] to-[#080808] p-6 sm:p-10">
          {/* Meta header */}
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
            <StatusBadge match={m} />
          </div>

          {/* Score grande con loghi */}
          <div className="grid grid-cols-3 items-center gap-4 py-4">
            <TeamBlock name={m.home_team} logo={m.home_team_logo} side="home" />
            <ScoreBlock match={m} />
            <TeamBlock name={m.away_team} logo={m.away_team_logo} side="away" />
          </div>

          {/* Info */}
          <div className="mt-6 space-y-2 border-t border-[#1f1f1f] pt-5 text-sm text-zinc-400">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-600" />
              <span>{formatStart(m.start_time)}</span>
            </div>
            {m.venue && (
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4 text-zinc-600" />
                <span>{m.venue}</span>
              </div>
            )}
            {m.competition && (
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-4 w-4 text-zinc-600" />
                <span>{m.competition}</span>
              </div>
            )}
          </div>
        </article>

        {/* Schedina */}
        <SlipPanel isLoggedIn={isLoggedIn} disabled={isFinished || isPostponed} matchId={m.id} />

        {/* Note legali per match a venire */}
        {(isScheduled || isLive) && (
          <p className="mt-6 text-center text-[10px] uppercase tracking-widest text-zinc-600"
             style={{ fontFamily: 'var(--font-dm-mono)' }}>
            Punteggi forniti da fonti pubbliche · 18+ · Gioca responsabile
          </p>
        )}
      </main>

      <Footer />
      <BottomNav />
    </>
  )
}

/* ============================================================ */
function StatusBadge({ match }: { match: MatchRow }) {
  if (match.status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
        <span
          className="h-2 w-2 rounded-full bg-red-500"
          style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
        />
        LIVE {match.minute ?? ''}
      </span>
    )
  }
  if (match.status === 'finished') {
    return (
      <span className="rounded-md bg-zinc-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
        Terminata
      </span>
    )
  }
  if (match.status === 'postponed') {
    return (
      <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-400">
        Rinviata
      </span>
    )
  }
  return (
    <span className="rounded-md bg-[#e8c800]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#e8c800]">
      Programmata
    </span>
  )
}

function TeamBlock({ name, logo, side }: { name: string; logo: string | null; side: 'home' | 'away' }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${
        side === 'home' ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left'
      }`}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={name}
          className="h-14 w-14 rounded-full object-contain bg-white p-1 sm:h-20 sm:w-20"
          loading="lazy"
        />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#1f1f1f] bg-[#141414] text-2xl sm:h-20 sm:w-20">
          {side === 'home' ? '🏠' : '✈️'}
        </div>
      )}
      <span
        className="text-center text-sm uppercase tracking-tight text-white sm:text-lg"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {name}
      </span>
    </div>
  )
}

function ScoreBlock({ match }: { match: MatchRow }) {
  const hasScore = match.home_score !== null && match.away_score !== null
  if (hasScore) {
    return (
      <div className="text-center">
        <div
          className="text-5xl tabular-nums text-white sm:text-7xl"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          <span>{match.home_score}</span>
          <span className="mx-2 text-zinc-600 sm:mx-3">–</span>
          <span>{match.away_score}</span>
        </div>
        {match.minute && (
          <div
            className="mt-2 text-xs uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {match.minute}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="text-center">
      <div
        className="text-3xl tabular-nums text-zinc-300 sm:text-5xl"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {new Date(match.start_time).toLocaleTimeString('it-IT', {
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome',
        })}
      </div>
      <div
        className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        VS
      </div>
    </div>
  )
}

function SlipPanel({
  isLoggedIn, disabled, matchId,
}: { isLoggedIn: boolean; disabled: boolean; matchId: string }) {
  if (!isLoggedIn) {
    return (
      <section className="mt-6 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 text-center">
        <Ticket className="mx-auto mb-2 h-6 w-6 text-zinc-500" />
        <p className="text-sm text-zinc-400">
          Accedi per aggiungere questa partita alle tue schedine.
        </p>
        <Link
          href={`/login?redirect=/live/${matchId}`}
          className="mt-3 inline-block rounded-xl bg-[#e8c800] px-5 py-2 text-xs uppercase tracking-wider text-black transition hover:scale-[1.02]"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Accedi
        </Link>
      </section>
    )
  }
  return (
    <section className="mt-6 rounded-2xl border border-[#e8c800]/30 bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-5">
      <div className="flex items-start gap-3">
        <Ticket className="h-6 w-6 shrink-0 text-[#e8c800]" />
        <div className="flex-1">
          <h2
            className="text-sm uppercase tracking-tight text-[#e8c800]"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Aggiungi a schedina
          </h2>
          <p className="mt-2 text-xs text-zinc-400">
            {disabled
              ? "Match già concluso o rinviato, non puoi più aggiungerla."
              : "Sistema schedine in arrivo. Qui potrai selezionare pronostici 1X2, Over/Under, Goal/NoGoal."}
          </p>
          <button
            disabled
            className="mt-4 cursor-not-allowed rounded-xl bg-zinc-800 px-5 py-2.5 text-sm uppercase tracking-wider text-zinc-500"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            In arrivo
          </button>
        </div>
      </div>
    </section>
  )
}
