/**
 * components/layout/Header.tsx v3
 *
 * Mobile-first minimal: solo logo + search + profilo.
 * La nav primaria sta nel BottomNav fisso. Hamburger rimosso.
 * Su desktop la nav resta inline.
 */
import React from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';

const NAV_LINKS = [
  { href: '/news', label: 'Notizie' },
  { href: '/live', label: 'Live' },
  { href: '/schedine', label: 'Schedine' },
  { href: '/fantacalcio', label: 'Fantacalcio' },
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
    <header className="sticky top-0 z-30 border-b border-otc-line bg-otc-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1340px] items-center gap-4 px-4 py-3 sm:px-6">
        {/* Logo cliccabile */}
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo size={26} compact />
        </Link>

        {/* Nav inline solo desktop */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition hover:bg-otc-surface hover:text-otc-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search compatta */}
        <Link
          href="/search"
          aria-label="Cerca"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-otc-line bg-otc-surface text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent"
        >
          <Search className="h-4 w-4" />
        </Link>

        {/* Profilo / Inizia */}
        {userEmail ? (
          <Link
            href="/profile"
            aria-label="Profilo"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-otc-line bg-otc-surface text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent sm:hidden"
          >
            <User className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/signup"
            className="hidden rounded-lg bg-otc-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition hover:opacity-90 sm:inline-flex"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Inizia
          </Link>
        )}
        {userEmail && (
          <Link
            href="/profile"
            className="hidden rounded-lg bg-otc-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition hover:opacity-90 sm:inline-flex"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Profilo
          </Link>
        )}
        {!userEmail && (
          <Link
            href="/login"
            aria-label="Accedi"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-otc-line bg-otc-surface text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent sm:hidden"
          >
            <User className="h-4 w-4" />
          </Link>
        )}
      </div>
    </header>
  );
}
