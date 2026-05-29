/**
 * app/live/page.tsx
 * Sezione eventi stile SofaScore:
 *  - Header con totali (live ora + programmati oggi)
 *  - Navigatore date orizzontale
 *  - Filtro sport (Tutti / Calcio / Basket)
 *  - Sezioni separate: 🔴 Live ora, ⏰ Programmati, ✓ Terminati, ⏸ Rinviati
 *  - Match raggruppati per competizione dentro ogni sezione
 *  - Empty state intelligente per data senza match
 */
import Link from 'next/link'
import { Radio, Clock, Check, Pause, Calendar as CalIcon } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { MatchCard } from '@/components/match/MatchCard'
import { MatchDateNav } from '@/components/match/MatchDateNav'
import { EmptyState } from '@/components/shared/EmptyState'
import { fetchMatchesByDate, fetchMatchCountsByStatus } from '@/lib/sports/matches'
import type { MatchRow } from '@/lib/sports/types'

export const revalidate = 60

export const metadata = {
  title: 'Live & Calendario partite',
  description: 'Calendario partite calcio e basket, risultati live in tempo reale.',
}

interface PageProps {
  searchParams: Promise<{ date?: string; sport?: string }>
}

export default async function LivePage({ searchParams }: PageProps) {
  const params = await searchParams
  const today = new Date().toISOString().slice(0, 10)
  const activeDate = params.date ?? today
  const sportFilter = params.sport

  const [matchesRaw, counts] = await Promise.all([
    fetchMatchesByDate(activeDate),
    fetchMatchCountsByStatus(),
  ])

  const matches = sportFilter ? matchesRaw.filter(m => m.sport === sportFilter) : matchesRaw

  const live = matches.filter(m => m.status === 'live')
  const scheduled = matches.filter(m => m.status === 'scheduled')
  const finished = matches.filter(m => m.status === 'finished')
  const postponed = matches.filter(m => m.status === 'postponed')

  const isToday = activeDate === today
  const dateLabel = formatDateLabel(activeDate, isToday)

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        {/* Header pagina */}
        <header className="mb-2 flex items-baseline justify-between">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Live<span className="text-[#e8c800]">.</span>
          </h1>
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            {counts.live > 0 && (
              <span className="inline-flex items-center gap-1 text-red-400">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-red-500"
                  style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
                />
                {counts.live} live
              </span>
            )}
            <span className="text-zinc-500">{matches.length} match · {dateLabel}</span>
          </div>
        </header>

        {/* Navigatore date */}
        <MatchDateNav activeDate={activeDate} />

        {/* Filtro sport */}
        <SportFilter activeSport={sportFilter} activeDate={activeDate} today={today} />

        {/* Contenuto */}
        {matches.length === 0 ? (
          <EmptyStateMatches isToday={isToday} dateLabel={dateLabel} hasSport={!!sportFilter} />
        ) : (
          <div className="space-y-7">
            {live.length > 0 && (
              <MatchSection
                label="Live ora"
                icon={<Radio className="h-4 w-4 text-red-500" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }} />}
                color="red"
                matches={live}
              />
            )}
            {scheduled.length > 0 && (
              <MatchSection
                label="Programmati"
                icon={<Clock className="h-4 w-4 text-[#e8c800]" />}
                color="yellow"
                matches={scheduled}
              />
            )}
            {finished.length > 0 && (
              <MatchSection
                label="Terminati"
                icon={<Check className="h-4 w-4 text-zinc-400" />}
                color="gray"
                matches={finished}
              />
            )}
            {postponed.length > 0 && (
              <MatchSection
                label="Rinviati"
                icon={<Pause className="h-4 w-4 text-orange-400" />}
                color="orange"
                matches={postponed}
              />
            )}
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </>
  )
}

/* ============================================================
 * Sezione match raggruppati per competizione
 * ============================================================ */
function MatchSection({
  label, icon, color, matches,
}: {
  label: string
  icon: React.ReactNode
  color: 'red' | 'yellow' | 'gray' | 'orange'
  matches: MatchRow[]
}) {
  const colorClasses: Record<typeof color, string> = {
    red: 'bg-red-500/15 text-red-400',
    yellow: 'bg-[#e8c800]/15 text-[#e8c800]',
    gray: 'bg-zinc-500/15 text-zinc-400',
    orange: 'bg-orange-500/15 text-orange-400',
  }

  // Raggruppa per competizione
  const byComp = new Map<string, MatchRow[]>()
  for (const m of matches) {
    const key = m.competition ?? 'Altro'
    const arr = byComp.get(key) ?? []
    arr.push(m)
    byComp.set(key, arr)
  }
  const sortedComps = Array.from(byComp.entries()).sort((a, b) => b[1].length - a[1].length)

  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <h2
          className="text-sm uppercase tracking-tight text-white sm:text-base"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {label}
        </h2>
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${colorClasses[color]}`}
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {matches.length}
        </span>
      </header>

      <div className="space-y-5">
        {sortedComps.map(([comp, items]) => (
          <div key={comp}>
            {sortedComps.length > 1 && (
              <h3
                className="mb-2 text-[10px] uppercase tracking-widest text-zinc-500"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {comp}
                <span className="ml-2 text-zinc-700">({items.length})</span>
              </h3>
            )}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {items.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
 * Filtro sport
 * ============================================================ */
function SportFilter({
  activeSport, activeDate, today,
}: { activeSport?: string; activeDate: string; today: string }) {
  const base = activeDate === today ? '/live' : `/live?date=${activeDate}`
  const withSport = (s: string) =>
    activeDate === today ? `/live?sport=${s}` : `/live?date=${activeDate}&sport=${s}`

  const sports: { id: string | undefined; label: string; emoji: string }[] = [
    { id: undefined, label: 'Tutti', emoji: '🏆' },
    { id: 'calcio', label: 'Calcio', emoji: '⚽' },
    { id: 'basket', label: 'Basket', emoji: '🏀' },
  ]

  return (
    <nav className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide">
      {sports.map(s => {
        const active = s.id === activeSport
        const href = s.id ? withSport(s.id) : base
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
        )
      })}
    </nav>
  )
}

/* ============================================================
 * Empty state intelligente
 * ============================================================ */
function EmptyStateMatches({
  isToday, dateLabel, hasSport,
}: { isToday: boolean; dateLabel: string; hasSport: boolean }) {
  if (hasSport) {
    return (
      <EmptyState
        emoji="🔍"
        title="Nessun match per questo sport"
        description={`Nessuna partita per questo sport ${dateLabel.toLowerCase()}. Prova un altro filtro o un'altra data.`}
        actionLabel="Mostra tutti"
        actionHref={isToday ? '/live' : `/live`}
      />
    )
  }
  return (
    <EmptyState
      emoji={isToday ? '⏰' : '📅'}
      title={isToday ? 'Nessun match oggi' : `Nessun match ${dateLabel.toLowerCase()}`}
      description={
        isToday
          ? "Non ci sono partite in programma oggi. Esplora i prossimi giorni nel calendario."
          : 'Nessuna partita programmata in questa data. Prova un altro giorno.'
      }
      actionLabel={isToday ? 'Vedi domani' : 'Vai a oggi'}
      actionHref={isToday ? `/live?date=${tomorrowIso()}` : '/live'}
    />
  )
}

function tomorrowIso(): string {
  const d = new Date(Date.now() + 86_400_000)
  return d.toISOString().slice(0, 10)
}

function formatDateLabel(iso: string, isToday: boolean): string {
  if (isToday) return 'Oggi'
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Rome',
  })
}
