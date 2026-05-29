/**
 * app/page.tsx — Home redesignata magazine-style
 *
 * Layout: hero (1 grande + 2 laterali) → LiveStrip → CTA live →
 * SportShortcuts → 4 card "in evidenza" → CTA archivio news.
 *
 * Schema snake_case allineato a NewsCard, LiveStrip, ecc.
 */
import Link from 'next/link';
import { ArrowRight, Radio, Newspaper } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
// Importiamo sia il componente che l'helper di mappatura appena creato
import { LiveStrip, mapMatchRowToLiveMatch } from '@/components/layout/LiveStrip';
import { SportShortcuts } from '@/components/shared/SportShortcuts';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews } from '@/lib/news/items';
import { fetchLiveMatches, fetchMatchCountsByStatus } from '@/lib/sports/matches';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 120;

export const metadata = {
  title: 'On The Corner — News e Live Sport',
  description: 'Lo sguardo veloce al mondo sportivo: news, live, schedine.',
};

export default async function HomePage() {
  const [heroRaw, liveMatches, counts] = await Promise.all([
    fetchLatestNews({ limit: 7 }),
    fetchLiveMatches(8),
    fetchMatchCountsByStatus(),
  ]);

  const hero = (heroRaw || []).map((row: any) => toNewsCardData(row));
  const heroMain = hero[0];
  const heroSide = hero.slice(1, 3);
  const evidenza = hero.slice(3, 7);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        <header className="mb-5">
          <p
            className="text-[10px] uppercase tracking-widest text-[#e8c800]"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Ciao, oggi su On The Corner ⚽
          </p>
          <h1
            className="mt-1 text-2xl uppercase tracking-tight text-white sm:text-3xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Il punto del giorno<span className="text-[#e8c800]">.</span>
          </h1>
        </header>

        {heroMain && (
          <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <NewsCard news={heroMain} variant="hero" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {heroSide.map((n) => (
                <NewsCard key={n.id} news={n} variant="default" />
              ))}
            </div>
          </section>
        )}

        {/* LIVESTRAP - Adesso i match vengono mappati in modo sicuro da MatchRow[] a LiveMatch[] */}
        <section className="mb-6">
          <LiveStrip matches={liveMatches?.map(mapMatchRowToLiveMatch)} />
        </section>

        {/* CTA verso /live */}
        {counts.today_scheduled > 0 && liveMatches.length === 0 && (
          <Link
            href="/live"
            className="mb-6 flex items-center justify-between rounded-2xl border border-[#e8c800]/30 bg-gradient-to-r from-[#0d0d0d] to-[#1a1500] p-4 transition hover:scale-[1.01]"
          >
            <div className="flex items-center gap-3">
              <Radio className="h-5 w-5 text-[#e8c800]" />
              <div>
                <p
                  className="text-sm uppercase tracking-tight text-[#e8c800]"
                  style={{ fontFamily: 'var(--font-archivo-black)' }}
                >
                  {counts.today_scheduled} partite oggi
                </p>
                <p className="text-xs text-zinc-400">Vai al calendario completo</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-
