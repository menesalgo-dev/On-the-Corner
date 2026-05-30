/**
 * components/sports/DateStrip.tsx
 *
 * Strip date orizzontale 7 giorni (ieri, oggi, +5 futuri).
 * Cliccabile, mostra giorno settimana + data.
 */
import Link from 'next/link';

interface Props {
  activeDate: string;  // YYYY-MM-DD
}

const WEEKDAYS_IT = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export function DateStrip({ activeDate }: Props) {
  // Genera 7 giorni: ieri + oggi + 5 prossimi
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 2);  // shift Italia
  const todayIso = now.toISOString().slice(0, 10);

  const days: { iso: string; weekday: string; day: number; isToday: boolean }[] = [];
  for (let i = -1; i <= 5; i++) {
    const d = new Date(`${todayIso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      iso,
      weekday: i === -1 ? 'Ieri' : i === 0 ? 'Oggi' : i === 1 ? 'Domani' : (WEEKDAYS_IT[d.getUTCDay()] ?? ''),
      day: d.getUTCDate(),
      isToday: iso === todayIso,
    });
  }

  return (
    <nav className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
      {days.map((d) => {
        const active = d.iso === activeDate;
        return (
          <Link
            key={d.iso}
            href={`/live?date=${d.iso}`}
            className={`flex min-w-[64px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-3 py-2.5 transition ${
              active
                ? 'border-otc-accent bg-otc-accent text-black'
                : 'border-otc-line bg-otc-surface text-zinc-400 hover:border-otc-accent/40 hover:text-otc-accent'
            }`}
          >
            <span
              className={`text-[9px] uppercase tracking-[0.15em] ${active ? 'text-black/70' : ''}`}
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {d.weekday}
            </span>
            <span
              className={`text-xl ${active ? 'text-black' : 'text-white'}`}
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {d.day}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
