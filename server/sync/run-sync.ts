// 1. Assicurati che in cima al file ci sia questa importazione nativa:
import { createClient } from '@supabase/supabase-js';

// ... (tutto il resto del tuo codice rimane invariato) ...

export async function runSync(): Promise<SyncResult> {
  const t0 = Date.now();

  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supaUrl || !serviceRole) {
    return {
      ok: false,
      elapsed_ms: 0,
      fetched: { rss: 0, newsapi: 0, guardian: 0, gnews: 0, total: 0 },
      after_dedup: 0,
      after_balance: 0,
      upserted: 0,
      deleted: 0,
      perSource: {},
      perCategory: {},
      failed: [],
      error: 'Missing SUPABASE env vars',
    };
  }

  // ✅ Inizializzazione standard senza l'oggetto auth personalizzato che creava il conflitto di path
  const supabase = createClient(supaUrl, serviceRole);

  // ... (tutto il resto del tuo codice di fetch, dedup e chunk rimane identico) ...
