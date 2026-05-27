/**
 * app/slips/page.tsx
 * Placeholder per W5 (schedine).
 */
import { redirect } from 'next/navigation';
import { Ticket } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Schedine' };

export default async function SlipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/slips');

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <h1
          className="text-2xl uppercase tracking-tight sm:text-4xl"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          Schedine<span className="text-[#e8c800]">.</span>
        </h1>

        <section className="mt-8 rounded-3xl border border-[#1f1f1f] bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8c800]/10 text-[#e8c800]">
              <Ticket className="h-6 w-6" />
            </div>
            <div>
              <h2
                className="text-xl uppercase tracking-tight text-white sm:text-2xl"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Schedine in arrivo
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Crea e traccia le tue schedine in tempo reale. Vedi le pick
                aggiornate live durante le partite, calcola vincita potenziale,
                esporta in PDF per la tabaccheria, condividi con gli amici.
                Disponibile da Settimana 5.
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
