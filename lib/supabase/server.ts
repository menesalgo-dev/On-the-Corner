/**
 * lib/supabase/server.ts
 * Client Supabase per Server Components, Server Actions, Route Handlers.
 * VERSIONE FIX: tipi espliciti per evitare errori in strict mode.
 */
import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Setter chiamato da Server Component: ignorato.
            // Il middleware si occupa di refreshare la sessione.
          }
        },
      },
    },
  );
}
