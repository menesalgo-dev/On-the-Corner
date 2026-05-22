/**
 * middleware.ts — Versione Edge-compatibile MINIMALE.
 *
 * Non usa @supabase/ssr (che in alcune build interne ha __dirname
 * incompatibile con Edge Runtime). Invece controlla manualmente la
 * presenza del cookie di sessione Supabase.
 *
 * Questo NON refresha il token, ma:
 *  - Permette il routing protected/auth
 *  - Funziona al 100% in Edge Runtime
 *  - Il refresh sessione viene fatto comunque dal client Supabase nelle
 *    Server Actions e Route Handlers quando serve.
 */
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/slips', '/profile', '/follow'];
const AUTH_PATHS = ['/login', '/signup'];

/**
 * Cerca un cookie di sessione Supabase tra quelli presenti.
 * I cookie di Supabase iniziano con `sb-` e finiscono con `-auth-token`.
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

  // Route protette: redirect a /login se non loggato
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Route auth: redirect alla home se gia' loggato
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
