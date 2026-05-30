/**
 * components/sports/MatchList.tsx
 *
 * Lista match raggruppata per competition.
 * Ogni match è una card con squadre, score, ora, stato.
 */
import type { MatchRow } from '@/lib/sports/types';

interface Props {
  matches: MatchRow[];
}

export function MatchList({ matches }: Props) {
  // Raggruppa per competition
  const groups = matches.reduce((acc, m) => {
    const key = m.competition || 'Altro';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, MatchRow[]>);

  const competitionOrder = Object.keys(groups).sort();

  return (
    <div className="space-y-6">
      {competitionOrder.map((comp) => {
        const items = groups[comp] ?? [];
        return (
          <section key={comp}>
            <header className="mb-2 flex items-center gap-2">
              <h3
                className="text-[11px] uppercase tracking-[0.2em] text-otc-accent"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {comp}
              </h3>
              <span className="text-[10px] text-zinc-600">·</span>
              <span
                className="text-[10px] uppercase tracking-widest text-zinc-600"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {items.length} {items.length === 1 ? 'match' : 'match'}
              </span>
            </header>
            <div className="divide-y divide-otc-line overflow-hidden rounded-2xl border border-otc-line bg-otc-surface">
              {items.map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MatchRow({ match }: { match: MatchRow }) {
  const time = formatMatchTime(match.start_time);
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div className="flex items-center gap-3 px-3 py-3 transition hover:bg-otc-bg/40 sm:gap-4 sm:px-4 sm:py-3.5">
      {/* Ora / Stato a sinistra */}
      <div className="w-14 shrink-0 text-center">
        {isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            Live
          </span>
        ) : isFinished ? (
          <span
            className="text-[10px] uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Finito
          </span>
        ) : (
          <span
            className="text-sm text-zinc-300"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            {time}
          </span>
        )}
      </div>

      {/* Squadre */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <TeamRow name={match.home_team} score={match.home_score} isFinished={isFinished} isLive={isLive} />
        <TeamRow name={match.away_team} score={match.away_score} isFinished={isFinished} isLive={isLive} />
      </div>

      {/* Sport icon */}
      <div className="shrink-0 text-lg opacity-50">
        {sportEmoji(match.sport)}
      </div>
    </div>
  );
}

function TeamRow({
  name, score, isFinished, isLive,
}: { name: string; score: number | null; isFinished: boolean; isLive: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`truncate text-sm ${isFinished ? 'text-zinc-400' : 'text-white'}`}>
        {name}
      </span>
      {(score !== null && (isFinished || isLive)) && (
        <span
          className={`shrink-0 text-sm tabular-nums ${isLive ? 'text-otc-accent' : 'text-zinc-300'}`}
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

function formatMatchTime(startTime: string): string {
  try {
    const d = new Date(startTime);
    // Mostra ora locale Italia (UTC+2)
    return d.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    });
  } catch {
    return '--:--';
  }
}

function sportEmoji(sport: string): string {
  const map: Record<string, string> = {
    calcio: '⚽',
    basket: '🏀',
    tennis: '🎾',
    f1: '🏎️',
    motogp: '🏍️',
    nfl: '🏈',
  };
  return map[sport] ?? '🏆';
}
