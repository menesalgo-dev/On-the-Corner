/**
 * app/follow/page.tsx
 * Placeholder per personalizzazione feed.
 * La versione completa con tutte le entità sarà nella prossima release.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Personalizza' };

const CATEGORIES = [
  { id: 'calcio', name: 'Calcio', emoji: '⚽' },
  { id: 'champions', name: 'Champions', emoji: '🏆' },
  { id: 'f1', name: 'Formula 1', emoji: '🏎️' },
  { id: 'motogp', name: 'MotoGP', emoji: '🏍️' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾' },
  { id: 'nfl', name: 'NFL', emoji: '🏈' },
];

export default async function FollowPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/follow');

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-8">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Personalizza<span className="text-[#e8c800]">.</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Scegli i tuoi sport preferiti per filtrare il feed.
          </p>
        </header>

        <section className="mb-8">
          <h2
            className="mb-4 text-[10px] uppercase tracking-widest text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Sport disponibili
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/sport/${c.id}`}
                className="group rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 transition hover:border-[#e8c800]/40 hover:-translate-y-0.5"
              >
                <div className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</div>
                <h3
                  className="mt-3 text-sm uppercase tracking-tight text-white group-hover:text-[#e8c800]"
                  style={{ fontFamily: 'var(--font-archivo-black)' }}
                >
                  {c.name}
                </h3>
                <p
                  className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  Vedi notizie →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#1f1f1f] bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <Star className="h-6 w-6 shrink-0 text-[#e8c800]" />
            <div>
              <h3
                className="text-base uppercase tracking-tight text-white"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Follow di squadre e atleti
              </h3>
              <p className="mt-2 text-sm text-zinc-400">
                Nella prossima release potrai seguire singole squadre (Inter, Milan,
                Real Madrid...) e atleti (Sinner, Verstappen, Bagnaia...) per ricevere
                un feed completamente personalizzato. Stay tuned!
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}
