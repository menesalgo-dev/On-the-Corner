/**
 * lib/supabase/server.ts
 * Client Supabase per Server Components, Server Actions e Route Handlers.
 * Legge/scrive cookie di sessione via cookies() di Next.js.
 */
import 'server-only';
import { createServerClient } from '@supabase/ssr';
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
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Setter chiamato da un Server Component: ignorato.
            // Il middleware si occupa di refreshare la sessione.
          }
        },
      },
    },
  );
}
