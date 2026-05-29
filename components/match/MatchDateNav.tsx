/**
 * components/match/MatchDateNav.tsx
 * Navigatore date stile SofaScore: ieri, oggi, domani, calendario.
 */
import Link from 'next/link';

interface Props {
  activeDate: string; // YYYY-MM-DD
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shortLabel(d: Date): string {
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', timeZone: 'Europe/Rome' });
}

export function MatchDateNav({ activeDate }: Props) {
  const today = new Date();
  const dates: { iso: string; label: string; isToday: boolean; emphasis?: 'ieri' | 'oggi' | 'domani' }[] = [];

  for (let i = -1; i <= 5; i++) {
    const d = new Date(today.getTime() + i * 86_400_000);
    const iso = formatDate(d);
    let emphasis: 'ieri' | 'oggi' | 'domani' | undefined;
    if (i === -1) emphasis = 'ieri';
    if (i === 0) emphasis = 'oggi';
    if (i === 1) emphasis = 'domani';
    dates.push({
      iso,
      label: emphasis ?? shortLabel(d),
      isToday: i === 0,
      emphasis,
    });
  }

  return (
    <nav className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
      {dates.map((d) => {
        const active = d.iso === activeDate;
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
            <span
              className="text-base"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {new Date(d.iso).getUTCDate()}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
