/**
 * middleware.ts — Versione bulletproof.
 *
 * Cambiamenti:
 *  - try/catch globale: se qualcosa esplode, lascia passare la richiesta
 *    invece di tornare 500. Loggiamo per Vercel Logs.
 *  - Validazione env vars con fallback esplicito.
 *  - Matcher più stretto: salta /auth/callback e altre rotte che non
 *    devono mai essere intercettate.
 *  - getUser() in try/catch dedicato per cookie corrotti.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PROTECTED_PATHS = ['/dashboard', '/slips', '/profile', '/follow'];
const AUTH_PATHS = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  // Fallback se le env mancano
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error('[middleware] Missing Supabase env vars. Skipping auth refresh.');
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // getUser() puo' lanciare se i cookie sono corrotti
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      console.warn('[middleware] getUser failed:', (err as Error).message);
    }

    const { pathname } = request.nextUrl;

    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (err) {
    console.error('[middleware] Unhandled error:', err);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api|auth/callback|favicon.ico|manifest.webmanifest|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
