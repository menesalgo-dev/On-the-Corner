/**
 * components/layout/BottomNav.tsx v2
 *
 * BottomNav fisso mobile, 4 voci. Su desktop è nascosto (la nav è inline header).
 * Mostra badge LIVE rosso pulsante se ci sono match in corso.
 */
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Radio, User } from 'lucide-react';

interface Props {
  liveCount?: number;
}

export function BottomNav({ liveCount = 0 }: Props) {
  const pathname = usePathname() ?? '/';

  const items = [
    { href: '/', icon: Home, label: 'Home', match: (p: string) => p === '/' },
    { href: '/news', icon: Newspaper, label: 'News', match: (p: string) => p.startsWith('/news') },
    {
      href: '/live',
      icon: Radio,
      label: 'Live',
      match: (p: string) => p.startsWith('/live'),
      badge: liveCount,
    },
    { href: '/profile', icon: User, label: 'Profilo', match: (p: string) => p.startsWith('/profile') || p.startsWith('/login') || p.startsWith('/signup') },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-otc-line bg-otc-bg/95 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-all ${
                active ? 'text-otc-accent' : 'text-zinc-500'
              }`}
            >
              <Icon
                className={`h-5 w-5 transition ${active ? 'scale-110' : ''}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className="text-[9px] uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                {item.label}
              </span>

              {/* Badge LIVE rosso pulsante */}
              {item.badge && item.badge > 0 ? (
                <span
                  className="absolute right-2 top-0 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white"
                  style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}

              {/* Indicatore pallino sotto */}
              {active && (
                <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-otc-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
