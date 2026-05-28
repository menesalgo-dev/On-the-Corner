/**
 * lib/sports/types.ts
 * Tipi condivisi per i match (calcio, basket).
 */

export type MatchSport = 'calcio' | 'basket';
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export interface MatchData {
  externalId: string;
  sport: MatchSport;
  source: string;
  competition: string | null;
  competitionCode: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  minute: string | null;
  startTime: string;   // ISO
  venue: string | null;
}

/** Riga DB (snake_case) */
export interface MatchRow {
  id: string;
  external_id: string;
  sport: string;
  source: string;
  competition: string | null;
  competition_code: string | null;
  home_team: string;
  away_team: string;
  home_team_logo: string | null;
  away_team_logo: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  minute: string | null;
  start_time: string;
  venue: string | null;
  last_updated: string;
  created_at: string;
}

export function matchDataToRow(m: MatchData): Omit<MatchRow, 'id' | 'created_at'> {
  return {
    external_id: m.externalId,
    sport: m.sport,
    source: m.source,
    competition: m.competition,
    competition_code: m.competitionCode,
    home_team: m.homeTeam,
    away_team: m.awayTeam,
    home_team_logo: m.homeTeamLogo,
    away_team_logo: m.awayTeamLogo,
    home_score: m.homeScore,
    away_score: m.awayScore,
    status: m.status,
    minute: m.minute,
    start_time: m.startTime,
    venue: m.venue,
    last_updated: new Date().toISOString(),
  };
}
