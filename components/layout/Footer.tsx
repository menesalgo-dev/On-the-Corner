/**
 * components/layout/Footer.tsx
 * Footer ricco: link, social, info legali.
 */
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

const FOOTER_LINKS = {
  esplora: [
    { href: '/news', label: 'Tutte le notizie' },
    { href: '/live', label: 'Live scores' },
    { href: '/search', label: 'Cerca' },
  ],
  sport: [
    { href: '/sport/calcio', label: 'Calcio' },
    { href: '/sport/f1', label: 'Formula 1' },
    { href: '/sport/motogp', label: 'MotoGP' },
    { href: '/sport/tennis', label: 'Tennis' },
    { href: '/sport/champions', label: 'Champions League' },
    { href: '/sport/nfl', label: 'NFL' },
  ],
  account: [
    { href: '/login', label: 'Accedi' },
    { href: '/signup', label: 'Registrati' },
    { href: '/follow', label: 'Personalizza feed' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  info: [
    { href: '/chi-siamo', label: 'Chi siamo' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#1f1f1f] bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-2 lg:col-span-2">
            <Logo size={36} withWordmark />
            <p className="mt-4 max-w-sm text-sm text-zinc-400">
              Aggregatore sportivo italiano premium. Notizie da 21 fonti,
              match live, schedine in tempo reale.
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest text-zinc-600" style={{ fontFamily: 'var(--font-dm-mono)' }}>
              Calcio · F1 · MotoGP · Tennis · Champions · NFL
            </p>
          </div>

          <FooterColumn title="Esplora" links={FOOTER_LINKS.esplora} />
          <FooterColumn title="Sport" links={FOOTER_LINKS.sport} />
          <FooterColumn title="Account" links={FOOTER_LINKS.account} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#1f1f1f] pt-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} On The Corner. Tutti i diritti riservati.
          </p>
          <div className="flex gap-4">
            <Link href="/chi-siamo" className="text-xs uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]">
              Chi siamo
            </Link>
            <span className="text-zinc-700">·</span>
            <span className="text-xs uppercase tracking-widest text-zinc-500" style={{ fontFamily: 'var(--font-dm-mono)' }}>
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
        className="mb-4 text-[10px] uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-zinc-300 transition hover:text-[#e8c800]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
