/**
 * app/page.tsx — Homepage di On The Corner.
 *
 * Versione landing semplice senza dipendenze da Supabase.
 * Quando vorrai mostrare le notizie dal DB, sostituirai con la
 * versione della Settimana 2 (server component).
 */
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(232,200,0,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,200,0,0.08), transparent 50%)',
          }}
        />

        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
          {/* Logo bandierina */}
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="On The Corner logo"
            role="img"
            className="mb-8"
          >
            <path d="M 8 56 Q 8 22 42 22" stroke="#e8c800" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
            <line x1="42" y1="22" x2="42" y2="56" stroke="#e8c800" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M 42 22 L 60 26 L 42 34 Z" fill="#e8c800"/>
            <line x1="6" y1="58" x2="58" y2="58" stroke="#e8c800" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          </svg>

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#e8c800]">
            v1.0 - in costruzione
          </p>

          <h1 className="mt-6 text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl" style={{ fontFamily: 'var(--font-archivo-black, sans-serif)' }}>
            On The <span className="text-[#e8c800]">Corner</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Sport, schedine e notizie in tempo reale.<br />
            <span className="text-zinc-300">L'evoluzione definitiva.</span>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#e8c800] px-6 py-3 text-sm uppercase tracking-wider text-black shadow-[0_0_24px_rgba(232,200,0,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(232,200,0,0.55)]"
              style={{ fontFamily: 'var(--font-archivo-black, sans-serif)' }}
            >
              Entra
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm uppercase tracking-wider text-white transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
              style={{ fontFamily: 'var(--font-archivo-black, sans-serif)' }}
            >
              Registrati
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center font-mono text-xs uppercase tracking-widest text-zinc-600">
        (c) {new Date().getFullYear()} On The Corner
      </footer>
    </main>
  );
}
