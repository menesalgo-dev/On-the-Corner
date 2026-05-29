/**
 * lib/sports/matches.ts
 * Frontend safe reader per tabella matches (sync Edge Function)
 */
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { MatchRow } from './types'

/** Helper: safe supabase client */
async function getSupabase() {
  return await createClient()
}

/**
 * Match per una data (YYYY-MM-DD) in UTC coerente con Edge Function
 * FIX: niente timezone hack + range corretto
 */
export async function fetchMatchesByDate(dateIso: string): Promise<MatchRow[]> {
  const supabase = await getSupabase()

  const start = new Date(`${dateIso}T00:00:00.000Z`)
  const end = new Date(`${dateIso}T23:59:59.999Z`)

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('start_time', start.toISOString())
    .lte('start_time', end.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[matchesByDate] error:', error)
    return []
  }

  return (data ?? []) as MatchRow[]
}

/**
 * Match by ID (pagina dettaglio)
 */
export async function fetchMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[matchById] error:', error)
    return null
  }

  return (data ?? null) as MatchRow | null
}

/**
 * LIVE matches (strip home)
 * FIX: status coerente con Edge Function
 */
export async function fetchLiveMatches(limit = 10): Promise<MatchRow[]> {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('start_time', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('[liveMatches] error:', error)
    return []
  }

  return (data ?? []) as MatchRow[]
}

/**
 * Conteggi per badge UI
 * FIX: oggi = UTC coerente con Edge Function
 */
export async function fetchMatchCountsByStatus(): Promise<{
  live: number
  today_scheduled: number
}> {
  const supabase = await getSupabase()

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const todayEnd = new Date(todayStart)
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1)

  const [{ count: live }, { count: scheduled }] = await Promise.all([
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'live'),

    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('start_time', todayStart.toISOString())
      .lt('start_time', todayEnd.toISOString()),
  ])

  return {
    live: live ?? 0,
    today_scheduled: scheduled ?? 0,
  }
}
