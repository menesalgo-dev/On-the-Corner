/**
 * components/layout/Header.tsx
 * Header sticky con logo, menu nav, search, profilo/login.
 * Versione responsive completa: hamburger mobile + nav desktop.
 */
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from './MobileMenu';

const NAV_LINKS = [
  { href: '/news', label: 'Notizie' },
  { href: '/live', label: 'Live' },
  { href: '/sport/calcio', label: 'Calcio' },
  { href: '/sport/f1', label: 'F1' },
  { href: '/sport/tennis', label: 'Tennis' },
  { href: '/sport/motogp', label: 'MotoGP' },
];

export async function Header() {
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    userEmail = data.user?.email ?? null;
  } catch {
    userEmail = null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#1f1f1f] bg-[#080808]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo size={32} withWordmark />
        </Link>

        {/* Nav desktop */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wider text-zinc-300 transition hover:bg-[#141414] hover:text-[#e8c800]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <Link
          href="/search"
          aria-label="Cerca"
          className="rounded-full border border-[#1f1f1f] bg-[#0d0d0d] p-2 text-zinc-400 transition hover:border-[#e8c800]/40 hover:text-[#e8c800] sm:px-3 sm:py-1.5"
        >
          <Search className="h-4 w-4" />
        </Link>

        {/* Auth */}
        {userEmail ? (
          <Link
            href="/profile"
            className="hidden rounded-full bg-[#e8c800] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black transition hover:scale-105 sm:inline-flex"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Profilo
          </Link>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-300 transition hover:text-[#e8c800]"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-[#e8c800] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black transition hover:scale-105"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              Inizia
            </Link>
          </div>
        )}

        {/* Mobile menu */}
        <MobileMenu navLinks={NAV_LINKS} isLoggedIn={!!userEmail} />
      </div>
    </header>
  );
}
