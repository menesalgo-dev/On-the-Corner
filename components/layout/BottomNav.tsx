/**
 * components/layout/BottomNav.tsx
 * Bottom navigation fissa per mobile (<lg). Cinque slot:
 * Home, Live, Schedine, Dashboard, Profilo.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Radio, Receipt, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Home', Icon: Home, match: (p: string) => p === '/' },
  { href: '/live', label: 'Live', Icon: Radio, match: (p: string) => p.startsWith('/live') },
  { href: '/slips', label: 'Schedine', Icon: Receipt, match: (p: string) => p.startsWith('/slips') },
  { href: '/dashboard', label: 'Stats', Icon: BarChart3, match: (p: string) => p.startsWith('/dashboard') },
  { href: '/profile', label: 'Profilo', Icon: User, match: (p: string) => p.startsWith('/profile') },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-otc-line bg-otc-bg/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="flex">
        {ITEMS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
                  active ? 'text-otc-accent' : 'text-otc-text-3 hover:text-otc-text-2',
                )}
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
