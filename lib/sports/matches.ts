/**
 * lib/sports/matches.ts
 * Lettura match dal DB allineata allo schema reale (start_time, status).
 * Finestra giornaliera Italia (UTC+1/+2) calcolata con ±2h di tolleranza.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { MatchRow } from './types';

/** Match per una data YYYY-MM-DD (giornata italiana). */
export async function fetchMatchesByDate(dateIso: string): Promise<MatchRow[]> {
  const supabase = await createClient();

  // Finestra: dalle 22:00 UTC del giorno precedente alle 23:59 UTC del giorno specificato
  // Copre Italia inverno (UTC+1) e estate (UTC+2)
  const start = new Date(`${dateIso}T00:00:00Z`);
  start.setUTCHours(start.getUTCHours() - 2);
  const end = new Date(`${dateIso}T23:59:59Z`);
  end.setUTCHours(end.getUTCHours() + 1);

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true });

  if (error) {
    console.error('[fetchMatchesByDate] error:', error.message, { dateIso });
    return [];
  }

  console.log(`[fetchMatchesByDate] ${dateIso}: ${(data ?? []).length} match`);
  return (data ?? []) as MatchRow[];
}

/** Match per id (pagina dettaglio). */
export async function fetchMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[fetchMatchById] error:', error.message);
    return null;
  }
  return (data ?? null) as MatchRow | null;
}

/** Match live in questo momento. */
export async function fetchLiveMatches(limit = 10): Promise<MatchRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('start_time', { ascending: true })
    .limit(limit);
  if (error) {
    console.error('[fetchLiveMatches] error:', error.message);
    return [];
  }
  return (data ?? []) as MatchRow[];
}

/** Conta match per status (per badge nav e CTA home). */
export async function fetchMatchCountsByStatus(): Promise<{ live: number; today_scheduled: number }> {
  const supabase = await createClient();

  const today = new Date();
  const dateIso = today.toISOString().slice(0, 10);
  const start = new Date(`${dateIso}T00:00:00Z`);
  start.setUTCHours(start.getUTCHours() - 2);
  const end = new Date(`${dateIso}T23:59:59Z`);
  end.setUTCHours(end.getUTCHours() + 1);

  const [liveQ, scheduledQ] = await Promise.all([
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString()),
  ]);

  return {
    live: liveQ.count ?? 0,
    today_scheduled: scheduledQ.count ?? 0,
  };
}
