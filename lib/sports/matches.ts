/**
 * lib/sports/matches.ts
 * Funzioni di lettura match dal DB per il frontend.
 */
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { MatchRow } from './types'

/** Match per una specifica data YYYY-MM-DD (timezone Europe/Rome). */
export async function fetchMatchesByDate(dateIso: string): Promise<MatchRow[]> {
  const supabase = await createClient()
  // Range: dateIso 00:00 Italia → dateIso 23:59 Italia (UTC-2 inverno/UTC-1 estate)
  // Per semplicità prendo una finestra 32h centrata
  const start = new Date(`${dateIso}T00:00:00.000Z`)
  start.setUTCHours(start.getUTCHours() - 2)
  const end = new Date(start.getTime() + 32 * 60 * 60 * 1000)

  const { data } = await supabase
    .from('matches')
    .select('*')
    .gte('start_time', start.toISOString())
    .lt('start_time', end.toISOString())
    .order('start_time', { ascending: true })

  return (data ?? []) as MatchRow[]
}

/** Match per id (pagina dettaglio). */
export async function fetchMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return (data ?? null) as MatchRow | null
}

/** Match live adesso (per strip in home). */
export async function fetchLiveMatches(limit = 10): Promise<MatchRow[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('start_time', { ascending: true })
    .limit(limit)
  return (data ?? []) as MatchRow[]
}

/** Conta match per status (per badge nav). */
export async function fetchMatchCountsByStatus(): Promise<{ live: number; today_scheduled: number }> {
  const supabase = await createClient()
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

  const [{ count: live }, { count: scheduled }] = await Promise.all([
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('start_time', todayStart.toISOString())
      .lt('start_time', todayEnd.toISOString()),
  ])

  return { live: live ?? 0, today_scheduled: scheduled ?? 0 }
}
