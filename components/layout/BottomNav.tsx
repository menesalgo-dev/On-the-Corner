/**
 * components/layout/BottomNav.tsx
 * Bottom nav fissa per mobile. 5 sezioni principali.
 */
'use client';

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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1f1f1f] bg-[#080808]/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  active ? 'text-[#e8c800]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
