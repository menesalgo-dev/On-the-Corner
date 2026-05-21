/**
 * app/page.tsx — Homepage di On The Corner.
 * Per ora è una landing pulita che mostra che l'app è viva.
 * Nelle settimane successive includerà hero notizia + grid news + live ticker.
 */
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* ───── Hero landing ───── */}
      <section className="relative overflow-hidden">
        {/* sfondo decorativo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(232,200,0,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(232,200,0,0.08), transparent 50%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(232,200,0,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(232,200,0,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          }}
        />

        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
          <Logo size={64} className="mb-8" />

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#e8c800]">
            v1.0 · in costruzione
          </p>

          <h1 className="mt-6 font-[var(--font-archivo-black)] text-5xl uppercase leading-[0.95] tracking-tight sm:text-7xl">
            On The <span className="text-[#e8c800]">Corner</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
            Sport, schedine e notizie in tempo reale. <br />
            <span className="text-zinc-300">L'evoluzione definitiva.</span>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#e8c800] px-6 py-3 font-[var(--font-archivo-black)] text-sm uppercase tracking-wider text-black shadow-[0_0_24px_rgba(232,200,0,0.35)] transition hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(232,200,0,0.55)]"
            >
              Entra
            </Link>
            <Link
              href="/signup"
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3 font-[var(--font-archivo-black)] text-sm uppercase tracking-wider text-white transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
            >
              Registrati
            </Link>
          </div>

          {/* Status row */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Fonti RSS" value="19" />
            <Stat label="Notizie/ora" value="~40" />
            <Stat label="Sport" value="6+" />
            <Stat label="Realtime" value="ON" highlight />
          </div>
        </div>
      </section>

      {/* ───── Feature preview ───── */}
      <section className="border-t border-zinc-900 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-[var(--font-archivo-black)] text-3xl uppercase tracking-tight sm:text-4xl">
            In arrivo
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card title="Notizie aggregate" desc="19 fonti RSS, deduplicate e ordinate per priorità." emoji="📰" />
            <Card title="Live scores" desc="Calcio, F1, Tennis con aggiornamenti realtime." emoji="🔴" />
            <Card title="Schedine live" desc="Crea, condividi e traccia la vincita in tempo reale." emoji="🎯" />
            <Card title="Follow squadre" desc="Personalizza il tuo feed con team, leghe, atleti." emoji="⭐" />
            <Card title="Dashboard ROI" desc="Statistiche, bankroll manager, grafici performance." emoji="📊" />
            <Card title="Gamification" desc="Badge, streak, leaderboard. Diventa una leggenda." emoji="🏆" />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center font-mono text-xs uppercase tracking-widest text-zinc-600">
        © {new Date().getFullYear()} On The Corner · Made with 🟡⚫ in Italia
      </footer>
    </main>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/60 px-4 py-5">
      <div
        className={`font-[var(--font-archivo-black)] text-2xl sm:text-3xl ${
          highlight ? 'text-[#e8c800]' : 'text-white'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </div>
    </div>
  );
}

function Card({ title, desc, emoji }: { title: string; desc: string; emoji: string }) {
  return (
    <div className="group rounded-2xl border border-zinc-900 bg-zinc-950/60 p-6 transition hover:border-[#e8c800]/30 hover:bg-zinc-950">
      <div className="mb-4 text-3xl transition-transform group-hover:scale-110">{emoji}</div>
      <h3 className="mb-2 font-[var(--font-archivo-black)] text-base uppercase tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-zinc-400">{desc}</p>
    </div>
  );
}
