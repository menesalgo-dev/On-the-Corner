/**
 * components/layout/Header.tsx
 * Header sticky Premium Minimal - Allineato con la sezione Fantacalcio e l'Archivio.
 */
import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from './MobileMenu';

// 🛠️ AGGIORNAMENTO NAV: Inserita la rotta Fantacalcio e rinominati i Segnalibri in Archivio
const NAV_LINKS = [
  { href: '/news', label: 'Notizie' },
  { href: '/live', label: 'Live' },
   { href: '/schedine', label: 'Schedine' },
  { href: '/fantacalcio', label: 'Fantacalcio' },
  { href: '/bookmarks', label: 'Archivio' },
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
    <header className="sticky top-0 z-40 border-b border-otc-line bg-otc-bg/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1340px] items-center gap-3 px-5 py-2.5 sm:px-6">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo size={28} compact />
        </Link>

        <nav className="ml-8 hidden items-center gap-1 lg:flex">
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

        <Link
          href="/search"
          aria-label="Cerca"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-otc-line bg-otc-surface p-1.5 text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent"
        >
          <Search className="h-3.5 w-3.5" />
        </Link>

        {userEmail ? (
          <Link
            href="/profile"
            className="hidden rounded-lg bg-otc-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition hover:opacity-90 sm:inline-flex"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Profilo
          </Link>
        ) : (
          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/login"
              className="text-xs font-semibold tracking-wider text-zinc-400 transition hover:text-otc-accent"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-otc-accent px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black transition hover:opacity-90"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Inizia
            </Link>
          </div>
        )}

        <MobileMenu navLinks={NAV_LINKS} isLoggedIn={!!userEmail} />
      </div>
    </header>
  );
}
