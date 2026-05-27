/**
 * components/layout/MobileMenu.tsx
 * Menu hamburger a comparsa laterale per dispositivi mobile.
 * Allineato con la palette otc, icone miniaturizzate ed estetica premium.
 */
'use client';

import React, { useState } from 'react';
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
        className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-otc-surface hover:text-otc-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* Sfondo Oscurato Velato (Backdrop) */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Pannello Scorrevole (Drawer) */}
          <aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[260px] flex-col border-l border-otc-line bg-otc-surface p-5 shadow-2xl lg:hidden"
            style={{ animation: 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="flex items-center justify-between border-b border-otc-line pb-3">
              <span 
                className="text-[9px] font-mono uppercase tracking-widest text-zinc-500" 
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Navigazione
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Chiudi menu"
                className="rounded-md p-1 text-zinc-500 transition hover:bg-otc-line hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Collegamenti Principali */}
            <nav className="mt-6 flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 transition hover:bg-otc-line hover:text-otc-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Area Account Inferiore */}
            <div className="mt-auto space-y-2 border-t border-otc-line pt-5">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:bg-otc-line hover:text-otc-accent"
                  >
                    Profilo
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-400 hover:bg-otc-line hover:text-otc-accent"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg border border-otc-line py-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Accedi
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg bg-otc-accent py-2 text-center text-[10px] font-bold uppercase tracking-wider text-black transition hover:opacity-90"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Inizia
                  </Link>
                </div>
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
