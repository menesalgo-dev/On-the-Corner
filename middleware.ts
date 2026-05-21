/**
 * middleware.ts — ROOT del progetto, NON dentro app/.
 *
 * Refresh automatico della sessione Supabase su ogni request.
 * Senza questo, dopo poche ore l'utente verrebbe scollegato.
 *
 * Inoltre: protegge le rotte private redirigendo a /login.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_PATHS = ['/dashboard', '/slips', '/profile', '/follow'];
const AUTH_PATHS = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ⚠️ Fondamentale: chiama getUser() per fare refresh dei token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Route protette: se non loggato → /login
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Route auth: se già loggato → /
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match tutte le rotte tranne:
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon, manifest, icone PWA
     * - file con estensione (.png, .svg, .jpg, .ico, ecc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
