/**
 * components/layout/BottomNav.tsx
 * Bottom navigation fissa per dispositivi mobile.
 * Allineata con la palette otc, icone miniaturizzate ed estetica premium.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, Newspaper, Search, User } from 'lucide-react';

const ITEMS = [
  { href: '/', label: 'Home', Icon: Home, match: (p: string) => p === '/' },
  { href: '/news', label: 'News', Icon: Newspaper, match: (p: string) => p.startsWith('/news') },
  { href: '/live', label: 'Live', Icon: Radio, match: (p: string) => p.startsWith('/live') },
  { href: '/search', label: 'Cerca', Icon: Search, match: (p: string) => p.startsWith('/search') },
  { href: '/profile', label: 'Profilo', Icon: User, match: (p: string) => p.startsWith('/profile') || p.startsWith('/login') || p.startsWith('/dashboard') },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-otc-line bg-otc-bg/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex justify-around items-center">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname || '');
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[9px] font-semibold uppercase tracking-widest transition-colors ${
                  active ? 'text-otc-accent' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {/* Micro-Icone con tratto ridotto per eliminare l'inquinamento visivo */}
                <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.2 : 1.8} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
