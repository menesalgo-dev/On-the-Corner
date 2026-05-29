/**
 * lib/sports/types.ts
 * Tipi condivisi per i match (calcio + basket + altri).
 */

export type MatchSport = 'calcio' | 'basket' | 'tennis' | 'altro'
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed'

/** Riga DB matches (snake_case, come Postgres) */
export interface MatchRow {
  id: string
  match_key: string
  external_id: string
  sport: string
  source: string
  competition: string | null
  competition_code: string | null
  home_team: string
  away_team: string
  home_team_logo: string | null
  away_team_logo: string | null
  home_score: number | null
  away_score: number | null
  status: string
  minute: string | null
  start_time: string
  venue: string | null
  last_updated: string
  created_at: string
}
