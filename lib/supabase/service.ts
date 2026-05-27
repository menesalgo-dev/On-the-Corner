/**
 * lib/supabase/service.ts
 * Client privilegiato che bypassa le RLS — DA USARE SOLO server-side.
 */
import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  // 🚨 FORZATURA HARDCODED DELL'URL PULITO
  // Sostituisci l'URL qui sotto con il link preciso del tuo progetto Supabase.
  // IMPORTANTE: Assicurati che NON ci sia il carattere "/" alla fine!
  const hardcodedSupaUrl = "https://xwkibfvastolrlbmivlg.supabase.co/rest/v1"; 

  return createSupabaseClient<Database>(
    hardcodedSupaUrl, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
