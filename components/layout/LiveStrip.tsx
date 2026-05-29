/**
 * components/layout/LiveStrip.tsx
 * Strip orizzontale match live. Placeholder per W4 (API sport).
 * Per ora mostra messaggio "Live in arrivo" se non ci sono match.
 */
import Link from 'next/link';
import { Radio } from 'lucide-react';

// Esportiamo l'interfaccia in modo da poterla usare come tipo nella Home e nei servizi
export interface LiveMatch {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  status: 'live' | 'scheduled' | 'finished';
}

interface Props {
  matches?: LiveMatch[];
}

export function LiveStrip({ matches = [] }: Props) {
  // Se non ci sono match passati, mostra placeholder informativo
  if (matches.length === 0) {
    return (
      <section className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-2 w-2 rounded-full bg-red-500"
            style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
          />
          <span className="text-[10px] uppercase tracking-widest text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
            Live ora
          </span>
          <span className="ml-auto text-xs text-zinc-500">
            Match live in arrivo nelle prossime settimane
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d]">
      <header className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-red-500" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
          <span className="text-[11px] uppercase tracking-widest text-white" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Live ora
          </span>
          <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
            {matches.length}
          </span>
        </div>
        <Link
          href="/live"
          className="text-[10px] uppercase tracking-widest text-zinc-400 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Tutti →
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
        {matches.map((m) => (
          <Link
            key={m.id}
            href={`/live/${m.id}`}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-[#1f1f1f] bg-[#141414] px-3 py-2 transition hover:border-[#e8c800]/40"
          >
            <span className="rounded bg-[#e8c800]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#e8c800]">
              {m.sport}
            </span>
            <span className="text-sm text-white">{m.homeTeam}</span>
            {m.homeScore !== undefined && (
              <span className="font-bold text-white" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                {m.homeScore}–{m.awayScore}
              </span>
            )}
            {m.awayTeam && <span className="text-sm text-white">{m.awayTeam}</span>}
            {m.minute && (
              <span className="text-[11px] text-[#e8c800]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                {m.minute}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
