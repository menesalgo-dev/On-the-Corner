/**
 * components/layout/MobileMenu.tsx
 * Menu hamburger per mobile. Si apre con animazione, slide da destra.
 */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

interface Props {
  navLinks: NavLink[];
  isLoggedIn: boolean;
}

export function MobileMenu({ navLinks, isLoggedIn }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Apri menu"
        className="rounded-lg p-2 text-zinc-300 transition hover:bg-[#141414] hover:text-[#e8c800] lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[280px] flex-col border-l border-[#1f1f1f] bg-[#0d0d0d] p-5 shadow-2xl lg:hidden"
            style={{ animation: 'slideIn 0.25s ease-out' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                Menu
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-[#141414] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-[#141414] hover:text-[#e8c800]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-2 border-t border-[#1f1f1f] pt-5">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#141414] hover:text-[#e8c800]"
                  >
                    Profilo
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#141414] hover:text-[#e8c800]"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/follow"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-zinc-200 hover:bg-[#141414] hover:text-[#e8c800]"
                  >
                    Personalizza
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl border border-[#1f1f1f] py-3 text-center text-sm font-bold uppercase tracking-wider text-zinc-200 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
                    style={{ fontFamily: 'var(--font-archivo-black)' }}
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl bg-[#e8c800] py-3 text-center text-sm font-bold uppercase tracking-wider text-black transition hover:scale-[1.02]"
                    style={{ fontFamily: 'var(--font-archivo-black)' }}
                  >
                    Inizia
                  </Link>
                </>
              )}
            </div>

            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to   { transform: translateX(0); }
              }
            `}</style>
          </aside>
        </>
      )}
    </>
  );
}
