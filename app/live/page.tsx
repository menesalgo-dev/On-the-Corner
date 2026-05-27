import React from 'react';
import { Radio } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews, fetchUserBookmarkHashes } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 120;

export const metadata = {
  title: 'Live scores — Calcio, F1, Tennis, MotoGP',
  description: 'Risultati live aggiornati in tempo reale.',
};

export default async function LivePage() {
  const [rawNews, bookmarkHashes] = await Promise.all([
    fetchLatestNews({ limit: 6 }),
    fetchUserBookmarkHashes(),
  ]);

  const compliantNews = (rawNews || []).map((row: any) => toNewsCardData(row));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12 bg-[#080808]">
        <header className="mb-6">
          <h1 className="text-2xl uppercase tracking-tight sm:text-4xl text-white" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Live<span className="text-[#e8c800]">.</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Risultati aggiornati in tempo reale per calcio, F1, MotoGP e tennis.</p>
        </header>

        <section className="mb-10 overflow-hidden rounded-3xl border border-[#1f1f1f] bg-gradient-to-br from-[#0d0d0d] to-[#1a1500] p-8 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }}>
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl uppercase tracking-tight text-white sm:text-2xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>Match live in arrivo</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Stiamo integrando le API gratuite per i match live: Football-Data.org per il calcio, Jolpica per F1, ATP/WTA per il tennis, MotoGP API per le moto.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-base uppercase tracking-tight text-white sm:text-xl" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Ultime <span className="text-[#e8c800]">News</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {compliantNews.map((item) => (
              <NewsCard key={item.id} news={item} isBookmarked={bookmarkHashes.has(item.id)} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
