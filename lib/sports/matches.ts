/**
 * lib/sports/matches.ts
 * Lettura match dal DB per le pagine.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { MatchRow } from './types';

/** Match per una specifica data (YYYY-MM-DD nel timezone Europe/Rome). */
export async function fetchMatchesByDate(dateIso: string): Promise<MatchRow[]> {
  const supabase = await createClient();
  // Range [dateIso 00:00 → dateIso+1 00:00] in UTC
  const start = new Date(`${dateIso}T00:00:00.000Z`);
  // Anticipo di 2 ore per coprire timezone Italia (UTC+1/+2)
  start.setUTCHours(start.getUTCHours() - 2);
  const end = new Date(start.getTime() + 28 * 60 * 60 * 1000); // 28h finestra

  const { data } = await supabase
    .from('matches')
    .select('*')
    .gte('start_time', start.toISOString())
    .lt('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  return (data ?? []) as MatchRow[];
}

/** Match per id (per la pagina dettaglio). */
export async function fetchMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return (data ?? null) as MatchRow | null;
}

/** Match live in questo momento (per home strip). */
export async function fetchLiveMatches(limit = 10): Promise<MatchRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('start_time', { ascending: true })
    .limit(limit);
  return (data ?? []) as MatchRow[];
}

/** Date che hanno match nei prossimi N giorni (per il navigatore date). */
export async function fetchAvailableMatchDates(daysAhead = 7): Promise<string[]> {
  const supabase = await createClient();
  const today = new Date();
  const to = new Date(today.getTime() + daysAhead * 86_400_000);
  const { data } = await supabase
    .from('matches')
    .select('start_time')
    .gte('start_time', today.toISOString())
    .lt('start_time', to.toISOString())
    .order('start_time', { ascending: true });
  const dates = new Set<string>();
  (data ?? []).forEach((r: { start_time: unknown }) => {
    const iso = String(r.start_time);
    dates.add(iso.slice(0, 10));
  });
  return Array.from(dates).sort();
}
