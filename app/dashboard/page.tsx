/**
 * app/dashboard/page.tsx
 * Placeholder per W6 (statistiche personali).
 */
import { redirect } from 'next/navigation';
import { TrendingUp, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/dashboard');

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <h1
          className="text-2xl uppercase tracking-tight sm:text-4xl"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Dashboard<span className="text-[#e8c800]">.</span>
        </h1>

        <section className="mt-8 rounded-3xl border border-[#1f1f1f] bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8c800]/10 text-[#e8c800]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2
                className="text-xl uppercase tracking-tight text-white sm:text-2xl"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Dashboard in arrivo
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Qui vedrai presto le tue statistiche: ROI delle schedine,
                squadre seguite, notizie salvate, badge sbloccati, classifica
                amici, andamento mensile e molto altro. Tutto in tempo reale.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill label="📊 ROI" />
                <Pill label="🏆 Badge" />
                <Pill label="📈 Trend" />
                <Pill label="👥 Amici" />
                <Pill label="🎯 Goals" />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <PlaceholderCard icon="🎰" title="Schedine" description="Tracking automatico" />
          <PlaceholderCard icon="📑" title="Bankroll" description="Gestione budget" />
          <PlaceholderCard icon="🏅" title="Achievement" description="Sblocca badge" />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[#1f1f1f] bg-[#141414] px-3 py-1 text-xs text-zinc-300">
      {label}
    </span>
  );
}

function PlaceholderCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
      <div className="text-3xl">{icon}</div>
      <h3
        className="mt-3 text-sm uppercase tracking-tight text-white"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </div>
  );
}
