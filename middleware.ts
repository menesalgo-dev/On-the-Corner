/**
 * middleware.ts
 *
 * Versione Edge-safe: controlla manualmente la presenza del cookie
 * di sessione Supabase senza importare @supabase/ssr.
 *
 * Perche': @supabase/ssr@0.5.x contiene internamente riferimenti a
 * __dirname che esplodono in Edge Runtime di Vercel. La doc ufficiale
 * Supabase sconsiglia infatti di usare createServerClient nel middleware
 * Edge. Il refresh token avviene comunque nelle Server Actions e
 * Route Handlers quando serve.
 *
 * Cosa fa questo middleware:
 *  - Controlla se l'utente ha un cookie sessione Supabase valido
 *  - Se accede a route protette senza sessione -> redirect /login
 *  - Se accede a /login o /signup gia' loggato -> redirect /
 *  - Tutte le altre rotte (/, /news, /live, ecc) passano sempre
 *
 * Architettura accessi:
 *  - Aperte a tutti: /, /news, /news/[id], /live, /live/[id]
 *  - Protette (richiedono login): /dashboard, /slips, /profile, /follow
 */
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/slips', '/profile', '/follow'];
const AUTH_PATHS = ['/login', '/signup'];

/**
 * Verifica presenza cookie sessione Supabase.
 * I cookie auth di Supabase iniziano con `sb-` e finiscono con `-auth-token`.
 */
function hasSupabaseSession(request: NextRequest): boolean {
  const cookies = request.cookies.getAll();
  return cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token') && c.value.length > 10,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = hasSupabaseSession(request);

  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|auth/callback|favicon.ico|manifest.webmanifest|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
