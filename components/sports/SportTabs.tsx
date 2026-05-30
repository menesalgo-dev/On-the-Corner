/**
 * components/sports/SportTabs.tsx
 *
 * Tabs dinamiche per filtrare i match per sport.
 * Mostrate SOLO se ci sono >1 sport nella data selezionata.
 */
import Link from 'next/link';

interface Props {
  activeSport?: string;
  sports: string[];
  date: string;
}

const SPORT_LABELS: Record<string, { label: string; emoji: string }> = {
  calcio: { label: 'Calcio', emoji: '⚽' },
  basket: { label: 'Basket', emoji: '🏀' },
  tennis: { label: 'Tennis', emoji: '🎾' },
  f1: { label: 'F1', emoji: '🏎️' },
  motogp: { label: 'MotoGP', emoji: '🏍️' },
  nfl: { label: 'NFL', emoji: '🏈' },
};

export function SportTabs({ activeSport, sports, date }: Props) {
  return (
    <nav className="mb-5 flex gap-2 overflow-x-auto scrollbar-hide">
      <Link
        href={`/live?date=${date}`}
        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
          !activeSport
            ? 'border-otc-accent bg-otc-accent text-black'
            : 'border-otc-line bg-otc-surface text-zinc-400 hover:border-otc-accent/40 hover:text-otc-accent'
        }`}
      >
        🏟️ Tutti
      </Link>
      {sports.map((s) => {
        const config = SPORT_LABELS[s] ?? { label: s, emoji: '🏆' };
        const active = s === activeSport;
        return (
          <Link
            key={s}
            href={`/live?date=${date}&sport=${s}`}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              active
                ? 'border-otc-accent bg-otc-accent text-black'
                : 'border-otc-line bg-otc-surface text-zinc-400 hover:border-otc-accent/40 hover:text-otc-accent'
            }`}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
