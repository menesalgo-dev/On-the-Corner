/**
 * lib/sports/matches.ts
 *
 * Lettura match dal DB per il frontend.
 * Allineato allo schema reale matches (start_time timestamptz, status text).
 *
 * NOTE: Italia è UTC+1 d'inverno, UTC+2 d'estate.
 * Per non perdere match alle 23:45 italiana di "domenica" che in UTC sono
 * 22:45 (domenica) oppure 21:45 (domenica), la finestra è calcolata in
 * timezone Europe/Rome usando i valori locali e poi convertita in UTC.
 */
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { MatchRow } from './types'

/**
 * Match per una specifica data YYYY-MM-DD (giornata italiana).
 * Range: dalle 00:00 italiane alle 23:59:59 italiane di quel giorno.
 */
export async function fetchMatchesByDate(dateIso: string): Promise<MatchRow[]> {
  const supabase = await createClient()

  // Costruisci range in timezone Italia: dalle 00:00 alle 23:59:59 locali.
  // Per coprire sia ora legale (UTC+2) che solare (UTC+1), allarghiamo di
  // 1 ora ai bordi così non perdiamo nulla per oscillazioni timezone.
  const startItaly = new Date(`${dateIso}T00:00:00+01:00`)
  const endItaly = new Date(`${dateIso}T23:59:59+01:00`)

  // Allarga di 1 ora ai bordi per sicurezza ora legale
  startItaly.setUTCHours(startItaly.getUTCHours() - 1)
  endItaly.setUTCHours(endItaly.getUTCHours() + 1)

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('start_time', startItaly.toISOString())
    .lte('start_time', endItaly.toISOString())
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[fetchMatchesByDate] error:', error.message, { dateIso })
    return []
  }

  console.log(`[fetchMatchesByDate] ${dateIso}: ${(data ?? []).length} match`)
  return (data ?? []) as MatchRow[]
}

/** Match per id (pagina dettaglio). */
export async function fetchMatchById(id: string): Promise<MatchRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) {
    console.error('[fetchMatchById] error:', error.message, { id })
    return null
  }
  return (data ?? null) as MatchRow | null
}

/** Match live adesso (per strip in home). */
export async function fetchLiveMatches(limit = 10): Promise<MatchRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live')
    .order('start_time', { ascending: true })
    .limit(limit)
  if (error) {
    console.error('[fetchLiveMatches] error:', error.message)
    return []
  }
  return (data ?? []) as MatchRow[]
}

/** Conta match per status (per badge nav e CTA home). */
export async function fetchMatchCountsByStatus(): Promise<{ live: number; today_scheduled: number }> {
  const supabase = await createClient()

  // Oggi in timezone Italia (con allargamento 1h per sicurezza)
  const today = new Date()
  const dateIso = today.toISOString().slice(0, 10)
  const startItaly = new Date(`${dateIso}T00:00:00+01:00`)
  const endItaly = new Date(`${dateIso}T23:59:59+01:00`)
  startItaly.setUTCHours(startItaly.getUTCHours() - 1)
  endItaly.setUTCHours(endItaly.getUTCHours() + 1)

  const [liveQ, scheduledQ] = await Promise.all([
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'live'),
    supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled')
      .gte('start_time', startItaly.toISOString())
      .lte('start_time', endItaly.toISOString()),
  ])

  return {
    live: liveQ.count ?? 0,
    today_scheduled: scheduledQ.count ?? 0,
  }
}

/** Date che hanno almeno un match (prossimi N giorni) — per dot nei nav. */
export async function fetchDatesWithMatches(daysAhead = 7): Promise<Set<string>> {
  const supabase = await createClient()
  const today = new Date()
  const from = new Date(today)
  from.setUTCHours(0, 0, 0, 0)
  const to = new Date(today.getTime() + daysAhead * 86_400_000)

  const { data, error } = await supabase
    .from('matches')
    .select('start_time')
    .gte('start_time', from.toISOString())
    .lt('start_time', to.toISOString())

  if (error) {
    console.error('[fetchDatesWithMatches]', error.message)
    return new Set()
  }

  const dates = new Set<string>()
  ;(data ?? []).forEach((r: { start_time: string }) => {
    // Estrai la data in Italia (UTC+1/+2). Approssimazione: aggiungi 1h.
    const d = new Date(r.start_time)
    d.setUTCHours(d.getUTCHours() + 1)
    dates.add(d.toISOString().slice(0, 10))
  })
  return dates
}
