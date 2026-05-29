/**
 * components/match/MatchDateNav.tsx
 * Navigatore date orizzontale: ieri, oggi, domani + 5 giorni avanti.
 */
import Link from 'next/link'

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function shortLabel(d: Date): string {
  return d.toLocaleDateString('it-IT', { weekday: 'short', timeZone: 'Europe/Rome' })
}

interface Props {
  activeDate: string  // YYYY-MM-DD
}

export function MatchDateNav({ activeDate }: Props) {
  const today = new Date()
  const dates: { iso: string; label: string; day: number; isToday: boolean }[] = []

  for (let i = -1; i <= 5; i++) {
    const d = new Date(today.getTime() + i * 86_400_000)
    const iso = formatDate(d)
    let label: string
    if (i === -1) label = 'IERI'
    else if (i === 0) label = 'OGGI'
    else if (i === 1) label = 'DOMANI'
    else label = shortLabel(d).toUpperCase()
    dates.push({ iso, label, day: d.getUTCDate(), isToday: i === 0 })
  }

  return (
    <nav className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
      {dates.map(d => {
        const active = d.iso === activeDate
        return (
          <Link
            key={d.iso}
            href={d.isToday ? '/live' : `/live?date=${d.iso}`}
            className={`flex shrink-0 flex-col items-center rounded-xl px-4 py-2 text-center transition ${
              active
                ? 'bg-[#e8c800] text-black'
                : 'border border-[#1f1f1f] bg-[#0d0d0d] text-zinc-300 hover:border-[#e8c800]/40 hover:text-[#e8c800]'
            }`}
          >
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {d.label}
            </span>
            <span className="text-base" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              {d.day}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
