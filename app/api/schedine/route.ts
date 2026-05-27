/**
 * app/api/schedine/route.ts
 * API Route Handler per l'inserimento e il tracciamento delle schedine virtuali.
 * Gratuito, allineato alle relazioni di live_matches e protetto da Supabase Auth.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Client amministrativo per eseguire inserimenti server-side bypassando i vincoli RLS rigidi
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

interface BetSelectionInput {
  matchId: string;
  prediction: string; // '1', 'X', '2', 'GG', 'NG', 'UNDER', 'OVER' ecc.
  odds: number;       // La quota del singolo evento (es: 1.85)
}

export async function POST(request: Request) {
  try {
    // 1. VERIFICA AUTENTICAZIONE UTENTE CORRENTE
    // Legge gli header della richiesta per verificare se c'è una sessione utente attiva
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Recupera l'utente a partire dai cookie di sessione inoltrati nativamente da Next.js
    const authHeader = request.headers.get('Authorization');
    let user_id: string | null = null;

    if (authHeader) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));
      user_id = user?.id ?? null;
    }

    // Se l'utente non è loggato, blocca l'inserimento per motivi di coerenza dei dati
    if (!user_id) {
      return NextResponse.json({ error: 'Autenticazione richiesta per salvare le schedine.' }, { status: 401 });
    }

    // 2. PARSING E VALIDAZIONE DEI DATI RICEVUTI DAL CLIENT
    const body = await request.json();
    const { stakeCents, selections } = body as { stakeCents: number; selections: BetSelectionInput[] };

    if (!stakeCents || stakeCents <= 0) {
      return NextResponse.json({ error: 'Importo della giocata non valido.' }, { status: 400 });
    }

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json({ error: 'Inserisci almeno un pronostico per comporre la bolletta.' }, { status: 400 });
    }

    // 3. CALCOLO AUTOMATICO DELLA QUOTA E MOLTIPLICATORE TOTALE
    // Moltiplica tra loro tutte le quote delle singole selezioni per ricavare la quota complessiva
    let totalOdds = 1.00;
    const formattedSelections = selections.map((sel) => {
      totalOdds = totalOdds * Number(sel.odds);
      return {
        match_id: sel.matchId,
        prediction: sel.prediction.toUpperCase(),
        odds: Number(sel.odds),
        status: 'open' // Lo stato iniziale di ogni singola partita è aperto
      };
    });

    // Arrotonda la quota totale a due cifre decimali (es: 14.55)
    totalOdds = Math.round(totalOdds * 100) / 100;

    // 4. INSERIMENTO TRANSAZIONALE NEL DATABASE SUPABASE
    // Fase A: Creazione della testata della schedina (user_bets)
    const { data: betRecord, error: betError } = await supabaseAdmin
      .from('user_bets')
      .insert({
        user_id: user_id,
        stake_cents: Math.round(stakeCents),
        total_odds: totalOdds,
        status: 'open'
      })
      .select()
      .single();

    if (betError || !betRecord) {
      throw new Error(`Errore inserimento testata bolletta: ${betError?.message}`);
    }

    // Fase B: Associazione delle singole partite alla schedina appena generata (user_bet_selections)
    const selectionsWithBetId = formattedSelections.map((sel) => ({
      ...sel,
      bet_id: betRecord.id
    }));

    const { error: selectionsError } = await supabaseAdmin
      .from('user_bet_selections')
      .insert(selectionsWithBetId);

    if (selectionsError) {
      // In produzione, se falliscono le selezioni bisognerebbe eliminare la testata (Rollback manuale)
      await supabaseAdmin.from('user_bets').delete().eq('id', betRecord.id);
      throw new Error(`Errore inserimento eventi interni: ${selectionsError.message}`);
    }

    // 5. RISPOSTA DI SUCCESSO
    return NextResponse.json({
      success: true,
      betId: betRecord.id,
      totalOdds: totalOdds,
      potentialPayoutCents: Math.round(stakeCents * totalOdds),
      message: 'Schedina registrata e tracciata con successo nell\'Archivio.'
    });

  } catch (err: any) {
    console.error('❌ Errore critico nel ricevitore schedine:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
