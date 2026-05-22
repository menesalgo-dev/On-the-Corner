/**
 * components/layout/Header.tsx
 * Header sticky desktop+mobile. Logo, link nav, status auth, search.
 */
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-otc-line bg-otc-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo size={32} withWordmark />
        </Link>

        {/* Nav desktop */}
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          <NavLink href="/news">Notizie</NavLink>
          <NavLink href="/live">Live</NavLink>
          <NavLink href="/slips">Schedine</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <Link
          href="/search"
          className="hidden items-center gap-2 rounded-full border border-otc-line bg-otc-surface px-3 py-1.5 text-sm text-otc-text-3 transition hover:border-zinc-700 hover:text-otc-text-2 sm:inline-flex"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Cerca…</span>
        </Link>

        {/* Auth area */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="rounded-full p-2 text-otc-text-2 transition hover:bg-otc-surface hover:text-otc-accent"
              aria-label="Notifiche"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/profile"
              className="rounded-full bg-otc-accent px-3 py-1.5 font-display text-[11px] uppercase tracking-wider text-black transition hover:scale-105"
            >
              Profilo
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-semibold text-otc-text-2 transition hover:text-otc-accent"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-otc-accent px-3 py-1.5 font-display text-[11px] uppercase tracking-wider text-black transition hover:scale-105"
            >
              Inizia
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-semibold uppercase tracking-wider text-otc-text-2 transition hover:bg-otc-surface hover:text-otc-accent"
    >
      {children}
    </Link>
  );
}
