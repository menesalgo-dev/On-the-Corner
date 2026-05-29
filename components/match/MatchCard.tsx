/**
 * components/match/MatchCard.tsx
 * Card di un singolo match — stile SofaScore.
 */
import Link from 'next/link'
import type { MatchRow } from '@/lib/sports/types'

const SPORT_EMOJI: Record<string, string> = {
  calcio: '⚽',
  basket: '🏀',
  tennis: '🎾',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome',
  })
}

interface Props {
  match: MatchRow
}

export function MatchCard({ match }: Props) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const isPostponed = match.status === 'postponed'
  const hasScore = match.home_score !== null && match.away_score !== null
  const emoji = SPORT_EMOJI[match.sport] ?? '🏆'

  return (
    <Link
      href={`/live/${match.id}`}
      className="group block rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] p-3 transition hover:border-[#e8c800]/40"
    >
      {/* Top: sport + competition + status */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="text-base shrink-0">{emoji}</span>
          {match.competition && (
            <span
              className="truncate text-[10px] uppercase tracking-widest text-zinc-500"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {match.competition}
            </span>
          )}
        </div>
        {isLive && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">
            <span
              className="h-1.5 w-1.5 rounded-full bg-red-500"
              style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
            />
            {match.minute ?? 'LIVE'}
          </span>
        )}
        {isFinished && (
          <span className="shrink-0 rounded-md bg-zinc-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-zinc-400">
            {match.minute ?? 'FT'}
          </span>
        )}
        {isPostponed && (
          <span className="shrink-0 rounded-md bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-orange-400">
            Rinviata
          </span>
        )}
        {!isLive && !isFinished && !isPostponed && (
          <span
            className="shrink-0 text-[10px] tabular-nums text-zinc-400"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            {formatTime(match.start_time)}
          </span>
        )}
      </div>

      {/* Teams + score */}
      <div className="space-y-1">
        <TeamRow
          name={match.home_team}
          logo={match.home_team_logo}
          score={match.home_score}
          highlight={isLive || isFinished}
        />
        <TeamRow
          name={match.away_team}
          logo={match.away_team_logo}
          score={match.away_score}
          highlight={isLive || isFinished}
        />
      </div>

      {!hasScore && !isLive && !isPostponed && (
        <div
          className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Programmata
        </div>
      )}
    </Link>
  )
}

function TeamRow({
  name, logo, score, highlight,
}: { name: string; logo: string | null; score: number | null; highlight: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt=""
            className="h-5 w-5 shrink-0 rounded-sm object-contain"
            loading="lazy"
          />
        ) : (
          <span className="h-5 w-5 shrink-0 rounded-sm bg-[#1f1f1f]" />
        )}
        <span className={`truncate text-sm ${highlight ? 'text-white' : 'text-zinc-300'}`}>
          {name}
        </span>
      </div>
      <span
        className={`shrink-0 text-base tabular-nums ${
          highlight ? 'font-bold text-white' : 'text-zinc-500'
        }`}
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {score !== null ? score : '–'}
      </span>
    </div>
  )
}
