/**
 * lib/sports/balldontlie.ts
 * Integrazione balldontlie.io (free tier 5 req/min).
 * Registrati: https://app.balldontlie.io (gratis, ricevi API key)
 *
 * NOTA: il free tier aggiorna i live score ogni ~10 minuti.
 * Quindi il basket non è "realtime" come il calcio, ma comunque utile.
 */
import { type MatchData, type MatchStatus } from './types';

const BASE = 'https://api.balldontlie.io/v1';

interface BDLTeam {
  id: number;
  abbreviation: string;
  full_name: string;
  name: string;
}

interface BDLGame {
  id: number;
  date: string;            // "2026-01-27"
  datetime?: string | null; // ISO con ora, se disponibile
  status: string;          // "Final", "1st Qtr", "Halftime", scheduled time, ecc.
  period: number;
  time: string | null;     // tempo rimanente nel periodo
  home_team: BDLTeam;
  visitor_team: BDLTeam;
  home_team_score: number;
  visitor_team_score: number;
}

interface BDLResponse {
  data: BDLGame[];
  meta?: { next_cursor?: number };
}

function mapStatus(g: BDLGame): MatchStatus {
  const s = (g.status || '').toLowerCase();
  if (s.includes('final')) return 'finished';
  if (s.includes('qtr') || s.includes('half') || s.includes('ot') || g.period > 0) {
    // Se ha periodo attivo e non è final → live
    if (!s.includes('final') && (g.home_team_score > 0 || g.visitor_team_score > 0 || g.period > 0)) {
      // potrebbe essere live o scheduled con orario
      if (s.includes('qtr') || s.includes('half') || s.includes('ot')) return 'live';
    }
  }
  return 'scheduled';
}

function mapMinute(g: BDLGame): string | null {
  const s = (g.status || '').toLowerCase();
  if (s.includes('final')) return 'Final';
  if (s.includes('half')) return 'HT';
  if (s.includes('qtr')) {
    return g.time ? `${g.status} ${g.time}` : g.status;
  }
  if (s.includes('ot')) return g.status;
  return null;
}

function parseStartTime(g: BDLGame): string {
  if (g.datetime) return g.datetime;
  // Se manca datetime, usa la data a mezzanotte UTC
  return new Date(`${g.date}T00:00:00Z`).toISOString();
}

function toMatchData(g: BDLGame): MatchData {
  return {
    externalId: String(g.id),
    sport: 'basket',
    source: 'balldontlie',
    competition: 'NBA',
    competitionCode: 'NBA',
    homeTeam: g.home_team?.full_name ?? g.home_team?.name ?? 'TBD',
    awayTeam: g.visitor_team?.full_name ?? g.visitor_team?.name ?? 'TBD',
    homeTeamLogo: null,  // balldontlie non fornisce loghi nel free tier
    awayTeamLogo: null,
    homeScore: g.home_team_score ?? null,
    awayScore: g.visitor_team_score ?? null,
    status: mapStatus(g),
    minute: mapMinute(g),
    startTime: parseStartTime(g),
    venue: null,
  };
}

async function bdlFetch(path: string): Promise<BDLResponse | null> {
  const apiKey = process.env.BALLDONTLIE_KEY;
  if (!apiKey) {
    console.warn('[balldontlie] BALLDONTLIE_KEY mancante, skip');
    return null;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: apiKey },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[balldontlie] HTTP ${res.status} su ${path}`);
      return null;
    }
    return (await res.json()) as BDLResponse;
  } catch (err) {
    console.warn('[balldontlie] fetch failed:', (err as Error).message);
    return null;
  }
}

/**
 * Calendario NBA: partite da oggi a +N giorni.
 */
export async function fetchBasketCalendar(daysAhead = 7): Promise<MatchData[]> {
  const today = new Date();
  const to = new Date(today.getTime() + daysAhead * 86_400_000);
  const start = today.toISOString().split('T')[0];
  const end = to.toISOString().split('T')[0];

  const data = await bdlFetch(`/games?start_date=${start}&end_date=${end}&per_page=100`);
  if (!data?.data) return [];
  return data.data.map(toMatchData);
}

/**
 * Match NBA di oggi (per sync live).
 */
export async function fetchBasketToday(): Promise<MatchData[]> {
  const today = new Date().toISOString().split('T')[0];
  const data = await bdlFetch(`/games?dates[]=${today}&per_page=100`);
  if (!data?.data) return [];
  return data.data.map(toMatchData);
}
