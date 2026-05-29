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
import { LiveStrip } from '@/components/layout/LiveStrip';
import { SportShortcuts } from '@/components/shared/SportShortcuts';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews } from '@/lib/news/items';
import { fetchLiveMatches, fetchMatchCountsByStatus } from '@/lib/sports/matches';
import { toNewsCardData } from '@/lib/news/types';

// Estraiamo dinamicamente il tipo del singolo match accettato dalle props di LiveStrip
type LiveMatchFromComponent = React.ComponentProps<typeof LiveStrip>['matches'][number];

export const revalidate = 120;

export const metadata = {
  title: 'On The Corner — News e Live Sport',
  description: 'Lo sguardo veloce al mondo sportivo: news, live, schedine.',
};

/**
 * Funzione di adapter che trasforma i dati grezzi del match (MatchRow / any)
 * nel formato esatto richiesto dal componente d'interfaccia LiveStrip.
 */
function toLiveMatchData(row: any): LiveMatchFromComponent {
  return {
    id: row.id,
    status: row.status,
    minute: row.minute ?? '',
    // Mappatura flessibile per gestire sia snake_case che camelCase provenienti dalla sorgente dati
    homeTeam: row.homeTeam || row.home_team || row.home_team_name || 'Home',
    awayTeam: row.awayTeam || row.away_team || row.away_team_name || 'Away',
    homeScore: row.homeScore ?? row.home_score ?? 0,
    awayScore: row.awayScore ?? row.away_score ?? 0,
    sport: row.sport || 'soccer',
  };
}

export default async function HomePage() {
  const [heroRaw, liveMatchesRaw, counts] = await Promise.all([
    fetchLatestNews({ limit: 7 }),
    fetchLiveMatches(8),
    fetchMatchCountsByStatus(),
  ]);

  // Formattazione dei dati delle News
  const hero = (heroRaw || []).map((row: any) => toNewsCardData(row));
  const heroMain = hero[0];
  const heroSide = hero.slice(1, 3);
  const evidenza = hero.slice(3, 7);

  // Formattazione pulita e tipizzata dei Live Matches tramite la funzione di adapter
  const liveMatches = (liveMatchesRaw || []).map((row: any) => toLiveMatchData(row));

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

        {/* LIVESTRIP — Ora riceve l'array perfettamente tipizzato ricavato dal componente stesso */}
        <section className="mb-6">
          <LiveStrip matches={liveMatches} />
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
            <ArrowRight className="h-5 w-5 text-[#e8c800]" />
          </Link>
        )}

        {/* Shortcuts sport */}
        <section className="mb-6">
          <SportShortcuts />
        </section>

        {/* In evidenza — 4 card piccole */}
        {evidenza.length > 0 && (
          <section className="mb-6">
            <header className="mb-3 flex items-baseline justify-between">
              <h2
                className="text-sm uppercase tracking-tight text-white"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                In evidenza
              </h2>
              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-[#e8c800]"
                style={{ fontFamily: 'var(--font-dm-mono)' }}
              >
                Archivio news <ArrowRight className="h-3 w-3" />
              </Link>
            </header>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {evidenza.map((n) => (
                <NewsCard key={n.id} news={n} variant="default" />
              ))}
            </div>
          </section>
        )}

        {/* CTA finale verso /news */}
        <Link
          href="/news"
          className="flex items-center justify-between rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4 transition hover:border-[#e8c800]/40"
        >
          <div className="flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm text-white">Cerchi una notizia?</p>
              <p className="text-xs text-zinc-500">
                Apri l&apos;archivio con filtri per categoria, fonte e data
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-500" />
        </Link>
      </main>

      <Footer />
      <BottomNav liveCount={counts.live} />
    </>
  );
}
