/**
 * app/api/calendar/route.ts
 * Endpoint per sincronizzare e scaricare il calendario completo delle partite da Football-Data.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Richiede una finestra temporale di match (es. gli ultimi 3 giorni e i prossimi 7 giorni)
    const apiResponse = await fetch('https://football-data.org', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' },
      next: { revalidate: 0 }
    });

    if (!apiResponse.ok) throw new Error(`Football-Data risponde con errore: ${apiResponse.status}`);
    const apiData = await apiResponse.json();
    const rawMatches = apiData.matches || [];

    const normalizedRows = rawMatches.map((match: any) => {
      let status: 'live' | 'scheduled' | 'finished' = 'scheduled';
      if (['IN_PLAY', 'PAUSED'].includes(match.status)) status = 'live';
      if (['FINISHED', 'AWARDED'].includes(match.status)) status = 'finished';

      let minute = '';
      const matchDate = new Date(match.utcDate);
      if (status === 'live') minute = match.minute ? String(match.minute) : 'Live';
      else if (status === 'finished') minute = 'FT';
      else {
        // Se è programmata, salva l'orario e la data abbreviata di inizio (es: 20:45)
        minute = matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      }

      return {
        id: `fb-${match.id}`,
        sport: 'Calcio',
        league: match.competition?.name || 'Campionato',
        home_team: match.homeTeam?.shortName || match.homeTeam?.name || 'Casa',
        away_team: match.awayTeam?.shortName || match.awayTeam?.name || 'Ospiti',
        home_score: String(match.score?.fullTime?.home ?? 0),
        away_score: String(match.score?.fullTime?.away ?? 0),
        event_status: status,
        match_minute: minute,
        live_details: `Data incontro: ${matchDate.toLocaleDateString('it-IT')}`,
        updated_at: new Date().toISOString()
      };
    });

    if (normalizedRows.length > 0) {
      const { error } = await supabaseAdmin.from('live_matches').upsert(normalizedRows, { onConflict: 'id' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, synced_calendar_count: normalizedRows.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
