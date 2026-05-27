/**
 * app/api/manual-sync/live/route.ts
 * Route API di backend per lo scraping e la sincronizzazione in tempo reale dei match.
 * Modello Sofascore compatto protetto da CRON_SECRET.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(request: Request) {
  try {
    // Controllo di sicurezza tramite Token Segreto per evitare chiamate non autorizzate
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // 1. CHIAMATA ALL'API SPORTIVA ESTERNA (Football-Data.org - Match di oggi)
    const apiResponse = await fetch('https://football-data.org', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '' },
      next: { revalidate: 0 } // Disabilita la cache di Next.js per avere dati freschi
    });

    if (!apiResponse.ok) {
      throw new Error(`Errore API esterna: ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();
    const rawMatches = apiData.matches || [];

    // 2. NORMALIZZAZIONE IN FORMATO SOFASCORE COMPATTO
    const normalizedRows = rawMatches.map((match: any) => {
      // Calcolo dello stato in stile Sofascore
      let status: 'live' | 'scheduled' | 'finished' = 'scheduled';
      if (['IN_PLAY', 'PAUSED'].includes(match.status)) status = 'live';
      if (['FINISHED', 'AWARDED'].includes(match.status)) status = 'finished';

      // Gestione del minutaggio o delle informazioni temporali
      let minute = '';
      if (match.status === 'IN_PLAY') minute = match.minute ? String(match.minute) : 'Live';
      if (match.status === 'PAUSED') minute = 'Intervallo';
      if (match.status === 'TIMED') {
        const matchDate = new Date(match.utcDate);
        minute = matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      }

      // Estrazione dei marcatori o dettagli dell'evento (se forniti dall'API)
      const goalsHome = match.score?.fullTime?.home ?? 0;
      const goalsAway = match.score?.fullTime?.away ?? 0;
      const details = status === 'live' || status === 'finished' 
        ? `Risultato parziale: ${goalsHome} - ${goalsAway}`
        : 'In attesa del fischio d\'inizio';

      return {
        id: `fb-${match.id}`, // Prefisso per evitare conflitti con altri sport (es. f1, tennis)
        sport: 'Calcio',
        league: match.competition?.name || 'Campionato',
        home_team: match.homeTeam?.shortName || match.homeTeam?.name || 'Casa',
        away_team: match.awayTeam?.shortName || match.awayTeam?.name || 'Ospiti',
        home_score: String(goalsHome),
        away_score: String(goalsAway),
        event_status: status,
        match_minute: minute,
        live_details: details,
        updated_at: new Date().toISOString()
      };
    });

    // 3. UPSERT DI MASSA SU SUPABASE (Scrive o aggiorna tutti i record in un'unica transazione)
    if (normalizedRows.length > 0) {
      const { error: upsertError } = await supabase
        .from('live_matches')
        .upsert(normalizedRows, { onConflict: 'id' });

      if (upsertError) throw upsertError;
    }

    return NextResponse.json({
      success: true,
      synced_matches_count: normalizedRows.length,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('❌ Errore critico nel sincronizzatore live:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
