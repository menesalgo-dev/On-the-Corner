/**
 * components/shared/SportShortcuts.tsx
 * Griglia compatta di shortcut alle categorie sportive principali.
 * Usata in home per navigare rapidamente a /news?category=xxx
 */
import Link from 'next/link'

const SHORTCUTS = [
  { id: 'calcio', label: 'Calcio', emoji: '⚽' },
  { id: 'champions', label: 'Champions', emoji: '🏆' },
  { id: 'f1', label: 'F1', emoji: '🏎️' },
  { id: 'motogp', label: 'MotoGP', emoji: '🏍️' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'nfl', label: 'NFL', emoji: '🏈' },
]

export function SportShortcuts() {
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between">
        <h2
          className="text-sm uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Categorie
        </h2>
        <Link
          href="/news"
          className="text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Tutte →
        </Link>
      </header>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.id}
            href={`/news?category=${s.id}`}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] py-3 transition hover:border-[#e8c800]/40 hover:bg-[#141414]"
          >
            <span className="text-xl transition group-hover:scale-110">{s.emoji}</span>
            <span
              className="text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-[#e8c800]"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {s.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
