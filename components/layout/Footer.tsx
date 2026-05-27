/**
 * components/layout/Footer.tsx
 * Footer Premium Minimal - Link, info legali e metadati.
 * Allineato con la palette otc e i link di navigazione ad Hash.
 */
import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

// 🛠️ LINK AGGIORNATI: Allineati alla navigazione del Dynamic Hub Slider
const FOOTER_LINKS = {
  esplora: [
    { href: '/news', label: 'Tutte le notizie' },
    { href: '/live', label: 'Live scores' },
    { href: '/search', label: 'Cerca' },
  ],
  sport: [
    { href: '/news?category=calcio', label: 'Calcio' },
    { href: '/news?category=f1', label: 'Formula 1' },
    { href: '/news?category=motogp', label: 'MotoGP' },
    { href: '/news?category=tennis', label: 'Tennis' },
  ],
  account: [
    { href: '/login', label: 'Accedi' },
    { href: '/signup', label: 'Registrati' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-otc-line bg-otc-bg">
      <div className="mx-auto max-w-[1340px] px-5 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <Logo size={28} withWordmark />
            <p className="mt-4 max-w-sm text-xs text-zinc-500 leading-relaxed">
              Aggregatore sportivo italiano premium. Notizie aggregate da 21 fonti,
              match live e statistiche in tempo reale.
            </p>
            <p 
              className="mt-3 text-[9px] font-mono uppercase tracking-widest text-zinc-600" 
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Calcio · F1 · MotoGP · Tennis
            </p>
          </div>

          <FooterColumn title="Esplora" links={FOOTER_LINKS.esplora} />
          <FooterColumn title="Sport" links={FOOTER_LINKS.sport} />
          <FooterColumn title="Account" links={FOOTER_LINKS.account} />
        </div>

        {/* Note Legali e Info Copyright */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-otc-line pt-6 sm:flex-row">
          <p className="text-[10px] font-mono text-zinc-600">
            © {new Date().getFullYear()} On The Corner. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-4">
            <Link 
              href="/chi-siamo" 
              className="text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-otc-accent"
            >
              Chi siamo
            </Link>
            <span className="text-zinc-800">•</span>
            <span 
              className="text-[10px] font-mono uppercase tracking-widest text-zinc-600" 
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3
        className="mb-4 text-[9px] font-mono uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-xs text-zinc-400 transition hover:text-otc-accent"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
