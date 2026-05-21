/**
 * components/slips/SlipTracker.tsx
 * Tracking realtime di una schedina: ogni pick si aggiorna live, la barra
 * di progresso gialla si riempie man mano che le pick vengono risolte, la
 * vincita potenziale resta aggiornata.
 *
 * Subscribe a:
 *   - canale postgres_changes su `slips` (riga corrente) → cambi di stato/quote
 *   - canale postgres_changes su `slip_picks` filtrato per slip_id
 */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Trophy, TrendingUp } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { Database } from '@/types/database.types';

type Slip = Database['public']['Tables']['slips']['Row'];
type Pick = Database['public']['Tables']['slip_picks']['Row'];

interface Props {
  initialSlip: Slip;
  initialPicks: Pick[];
}

const STATUS_STYLES: Record<Pick['status'], { bg: string; ring: string; icon: typeof CheckCircle2 }> = {
  pending: { bg: 'bg-zinc-800/50',  ring: 'ring-zinc-700',          icon: Loader2 },
  won:     { bg: 'bg-[#e8c800]/10', ring: 'ring-[#e8c800]/60',      icon: CheckCircle2 },
  lost:    { bg: 'bg-red-500/10',   ring: 'ring-red-500/40',        icon: XCircle },
  void:    { bg: 'bg-zinc-700/30',  ring: 'ring-zinc-600',          icon: XCircle },
};

export function SlipTracker({ initialSlip, initialPicks }: Props) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [slip, setSlip] = useState<Slip>(initialSlip);
  const [picks, setPicks] = useState<Pick[]>(
    [...initialPicks].sort((a, b) => a.position - b.position),
  );

  // ─── Realtime ───
  useEffect(() => {
    const channel = supabase
      .channel(`slip:${slip.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'slips', filter: `id=eq.${slip.id}` },
        (payload) => setSlip(payload.new as Slip),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slip_picks', filter: `slip_id=eq.${slip.id}` },
        (payload) => {
          setPicks((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((p) => p.id !== (payload.old as Pick).id);
            }
            const next = payload.new as Pick;
            const idx = prev.findIndex((p) => p.id === next.id);
            const updated = idx >= 0
              ? prev.map((p, i) => (i === idx ? next : p))
              : [...prev, next];
            return updated.sort((a, b) => a.position - b.position);
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, slip.id]);

  // ─── Progress (% pick risolte) ───
  const resolved = picks.filter((p) => p.status !== 'pending').length;
  const total = picks.length || 1;
  const progressPct = (resolved / total) * 100;

  const spring = useSpring(progressPct, { stiffness: 110, damping: 22 });
  const widthStyle = useTransform(spring, (v) => `${v}%`);

  useEffect(() => { spring.set(progressPct); }, [progressPct, spring]);

  // ─── Vincita potenziale formattata ───
  const potentialWin = (slip.potential_win_cents / 100).toFixed(2);
  const stake = (slip.stake_cents / 100).toFixed(2);

  // ─── Esito globale calcolato lato client per UI istantanea ───
  const isLost = picks.some((p) => p.status === 'lost');
  const allWon = picks.length > 0 && picks.every((p) => p.status === 'won');
  const localStatus = isLost ? 'lost' : allWon ? 'won' : slip.status;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-[#0d0d0d] p-5 sm:p-6">
      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-[var(--font-archivo-black)] text-xl sm:text-2xl uppercase tracking-tight text-white">
            {slip.title ?? `Schedina #${slip.id.slice(0, 6)}`}
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Quota totale <span className="text-[#e8c800] font-mono font-bold">{slip.total_odds.toFixed(2)}</span>
            {' · '} Puntata <span className="font-mono">{stake} €</span>
          </p>
        </div>

        <StatusPill status={localStatus} />
      </header>

      {/* ── Progress bar ── */}
      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-[#e8c800] shadow-[0_0_18px_rgba(232,200,0,0.45)]"
            style={{ width: widthStyle }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-zinc-500">
          <span>{resolved}/{picks.length} risolte</span>
          <span>{progressPct.toFixed(0)}%</span>
        </div>
      </div>

      {/* ── Vincita potenziale ── */}
      <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#e8c800]/30 bg-[#e8c800]/[0.04] px-4 py-3">
        <div className="flex items-center gap-2 text-zinc-300">
          <TrendingUp className="h-4 w-4 text-[#e8c800]" />
          <span className="text-sm uppercase tracking-wider">Vincita potenziale</span>
        </div>
        <span className="font-[var(--font-archivo-black)] text-2xl text-[#e8c800] tabular-nums">
          {potentialWin}€
        </span>
      </div>

      {/* ── Pick list ── */}
      <ul className="mt-5 space-y-2">
        {picks.map((p) => {
          const s = STATUS_STYLES[p.status];
          const Icon = s.icon;
          return (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-3 ring-1 ring-inset transition-colors',
                s.bg, s.ring,
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {p.market} · <span className="text-zinc-300">{p.selection}</span>
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-zinc-500">
                  Quota <span className="font-mono text-zinc-300">{p.odds.toFixed(2)}</span>
                </p>
              </div>
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  p.status === 'won'  && 'text-[#e8c800]',
                  p.status === 'lost' && 'text-red-500',
                  p.status === 'pending' && 'animate-spin text-zinc-500',
                  p.status === 'void' && 'text-zinc-500',
                )}
              />
            </motion.li>
          );
        })}
      </ul>

      {/* ── Footer: animazione vittoria ── */}
      {localStatus === 'won' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#e8c800] py-3 font-[var(--font-archivo-black)] uppercase text-black"
        >
          <Trophy className="h-5 w-5" />
          Schedina Vincente!
        </motion.div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: Slip['status'] }) {
  const map: Record<Slip['status'], { label: string; cls: string }> = {
    open:    { label: 'In corso', cls: 'bg-zinc-800 text-zinc-300' },
    won:     { label: 'Vinta',    cls: 'bg-[#e8c800] text-black' },
    lost:    { label: 'Persa',    cls: 'bg-red-500/15 text-red-400' },
    void:    { label: 'Annullata',cls: 'bg-zinc-700 text-zinc-300' },
    cashout: { label: 'Cashout',  cls: 'bg-blue-500/15 text-blue-400' },
  };
  const v = map[status];
  return (
    <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider', v.cls)}>
      {v.label}
    </span>
  );
}
