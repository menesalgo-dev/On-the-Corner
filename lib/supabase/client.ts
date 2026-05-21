/**
 * lib/supabase/client.ts
 * Client Supabase per Client Components (componenti `'use client'`).
 * Usa la chiave anon, rispetta le RLS.
 */
'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
