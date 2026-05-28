/**
 * lib/sports/football-data.ts
 * Integrazione Football-data.org (free 10 req/min, 12 leghe top).
 * Registrati: https://www.football-data.org/client/register
 *
 * IMPORTANTE rate limit: 10 req/min sul free tier.
 * Per questo usiamo /matches globale (1 sola chiamata) invece di
 * 1 chiamata per competizione.
 */
import { type MatchData, type MatchStatus } from './types';

const BASE = 'https://api.football-data.org/v4';

interface FDTeam {
  id: number;
  name: string;
  shortName?: string;
  tla?: string;
  crest?: string;
}

interface FDMatch {
  id: number;
  utcDate: string;
  status: string; // SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED
  minute?: number | null;
  competition: { id: number; name: string; code: string; emblem?: string };
  homeTeam: FDTeam;
  awayTeam: FDTeam;
  score: {
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue?: string;
}

interface FDResponse {
  matches: FDMatch[];
}

function mapStatus(fd: string): MatchStatus {
  switch (fd) {
    case 'IN_PLAY':
    case 'PAUSED':
    case 'SUSPENDED':
      return 'live';
    case 'FINISHED':
    case 'AWARDED':
      return 'finished';
    case 'POSTPONED':
    case 'CANCELLED':
      return 'postponed';
    default:
      return 'scheduled'; // SCHEDULED, TIMED
  }
}

function mapMinute(m: FDMatch): string | null {
  if (m.status === 'PAUSED') return 'HT';
  if (m.status === 'IN_PLAY' && typeof m.minute === 'number') return `${m.minute}'`;
  if (m.status === 'FINISHED') return 'FT';
  return null;
}

function toMatchData(m: FDMatch): MatchData {
  return {
    externalId: String(m.id),
    sport: 'calcio',
    source: 'football-data',
    competition: m.competition?.name ?? null,
    competitionCode: m.competition?.code ?? null,
    homeTeam: m.homeTeam?.shortName ?? m.homeTeam?.name ?? 'TBD',
    awayTeam: m.awayTeam?.shortName ?? m.awayTeam?.name ?? 'TBD',
    homeTeamLogo: m.homeTeam?.crest ?? null,
    awayTeamLogo: m.awayTeam?.crest ?? null,
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
    status: mapStatus(m.status),
    minute: mapMinute(m),
    startTime: m.utcDate,
    venue: m.venue ?? null,
  };
}

async function fdFetch(path: string): Promise<FDResponse | null> {
  const apiKey = process.env.FOOTBALL_DATA_KEY;
  if (!apiKey) {
    console.warn('[football-data] FOOTBALL_DATA_KEY mancante, skip');
    return null;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'X-Auth-Token': apiKey },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[football-data] HTTP ${res.status} su ${path}`);
      return null;
    }
    return (await res.json()) as FDResponse;
  } catch (err) {
    console.warn('[football-data] fetch failed:', (err as Error).message);
    return null;
  }
}

/**
 * Calendario: match da oggi a +N giorni.
 * 1 sola chiamata API (efficiente per rate limit).
 */
export async function fetchFootballCalendar(daysAhead = 7): Promise<MatchData[]> {
  const today = new Date();
  const to = new Date(today.getTime() + daysAhead * 86_400_000);
  const dateFrom = today.toISOString().split('T')[0];
  const dateTo = to.toISOString().split('T')[0];

  const data = await fdFetch(`/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`);
  if (!data?.matches) return [];
  return data.matches.map(toMatchData);
}

/**
 * Match di oggi (per il sync live). 1 sola chiamata.
 */
export async function fetchFootballToday(): Promise<MatchData[]> {
  const today = new Date().toISOString().split('T')[0];
  const data = await fdFetch(`/matches?dateFrom=${today}&dateTo=${today}`);
  if (!data?.matches) return [];
  return data.matches.map(toMatchData);
}
