/**
 * app/page.tsx — Home v3
 *
 * Layout editoriale, "uno sguardo veloce alla giornata sportiva":
 *  1. HERO: 1 news grande (full width)
 *  2. STRIP LIVE: solo se ci sono match, altrimenti CTA verso /live
 *  3. TOP STORIE: 2 col grande + secondaria
 *  4. CHIPS sport: shortcut per /news?category=
 *  5. RECENTI: 4-6 card piccole
 *  6. CTA archivio
 *
 * Niente "Tutti gli sport / Tutto / Calcio..." doppio tab.
 * Niente lista lunga di news (sta in /news).
 */
import Link from 'next/link';
import { ArrowRight, Radio, Newspaper, TrendingUp, Clock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { LiveStrip } from '@/components/layout/LiveStrip';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchLatestNews } from '@/lib/news';
import { fetchLiveMatches, fetchMatchCountsByStatus } from '@/lib/sports/matches';
import { toNewsCardData } from '@/lib/news/types';

export const revalidate = 120;

export const metadata = {
  title: 'On The Corner — News e Live Sport',
  description: 'Il punto del giorno: news, live, schedine.',
};

export default async function HomePage() {
  const [heroRaw, liveMatches, counts] = await Promise.all([
    fetchLatestNews({ limit: 9 }),
    fetchLiveMatches(8),
    fetchMatchCountsByStatus(),
  ]);

  const news = (heroRaw || []).map((row: any) => toNewsCardData(row));
  const hero = news[0];
  const secondary = news.slice(1, 3);
  const grid = news.slice(3, 9);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-5 sm:px-6 sm:pb-12 sm:pt-8 lg:pb-12">
        {/* TITOLO HEADER MINIMAL */}
        <header className="mb-6">
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-otc-accent"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Oggi su On The Corner
          </p>
          <h1
            className="mt-1 text-3xl uppercase tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-archivo-black)', letterSpacing: '-0.02em' }}
          >
            Il punto del giorno<span className="text-otc-accent">.</span>
          </h1>
        </header>

        {/* HERO BIG (1 news full width) */}
        {hero && (
          <section className="mb-8">
            <NewsCard news={hero} variant="hero" />
          </section>
        )}

        {/* LIVE STRIP — solo se ci sono match live */}
        {liveMatches.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              icon={<Radio className="h-3.5 w-3.5 animate-pulse text-red-500" />}
              label="Live adesso"
              cta={{ href: '/live', label: 'Tutti' }}
            />
            <LiveStrip matches={liveMatches} />
          </section>
        )}

        {/* CTA verso /live se non ci sono live ma ci sono match oggi */}
        {liveMatches.length === 0 && counts.today_scheduled > 0 && (
          <Link
            href="/live"
            className="mb-8 flex items-center justify-between rounded-2xl border border-otc-accent/30 bg-gradient-to-r from-otc-surface to-[#1a1500] p-4 transition hover:scale-[1.005] hover:border-otc-accent/60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-otc-accent/15">
                <Radio className="h-5 w-5 text-otc-accent" />
              </div>
              <div>
                <p
                  className="text-sm uppercase tracking-tight text-otc-accent"
                  style={{ fontFamily: 'var(--font-archivo-black)' }}
                >
                  {counts.today_scheduled} {counts.today_scheduled === 1 ? 'partita' : 'partite'} oggi
                </p>
                <p className="text-xs text-zinc-400">Vedi il calendario completo</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-otc-accent" />
          </Link>
        )}

        {/* TOP STORIE — 2 secondarie */}
        {secondary.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              icon={<TrendingUp className="h-3.5 w-3.5 text-otc-accent" />}
              label="Top storie"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {secondary.map((n) => (
                <NewsCard key={n.id} news={n} variant="default" />
              ))}
            </div>
          </section>
        )}

        {/* SHORTCUTS sport */}
        <section className="mb-8">
          <SectionHeader
            label="Categorie"
            cta={{ href: '/news', label: 'Tutte' }}
          />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SPORT_SHORTCUTS.map((s) => (
              <Link
                key={s.id}
                href={`/news?category=${s.id}`}
                className="group flex flex-col items-center gap-1.5 rounded-xl border border-otc-line bg-otc-surface py-3 transition hover:border-otc-accent/40 hover:bg-otc-surface/80"
              >
                <span className="text-xl transition group-hover:scale-110">{s.emoji}</span>
                <span
                  className="text-[10px] uppercase tracking-wider text-zinc-400 group-hover:text-otc-accent"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {s.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* RECENTI */}
        {grid.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              icon={<Clock className="h-3.5 w-3.5 text-otc-accent" />}
              label="Ultime news"
              cta={{ href: '/news', label: 'Archivio' }}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((n) => (
                <NewsCard key={n.id} news={n} variant="compact" />
              ))}
            </div>
          </section>
        )}

        {/* CTA finale verso /news */}
        <Link
          href="/news"
          className="flex items-center justify-between rounded-2xl border border-otc-line bg-otc-surface p-4 transition hover:border-otc-accent/40"
        >
          <div className="flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-zinc-400" />
            <div>
              <p className="text-sm text-white">Cerchi una notizia?</p>
              <p className="text-xs text-zinc-500">
                Apri l&apos;archivio con filtri per categoria e fonte
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

/* ============================================================
 * SectionHeader — header sezione riutilizzabile
 * ============================================================ */
function SectionHeader({
  icon, label, cta,
}: { icon?: React.ReactNode; label: string; cta?: { href: string; label: string } }) {
  return (
    <header className="mb-3 flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2
          className="text-xs uppercase tracking-[0.2em] text-white"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {label}
        </h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-otc-accent"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {cta.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </header>
  );
}

const SPORT_SHORTCUTS = [
  { id: 'calcio', label: 'Calcio', emoji: '⚽' },
  { id: 'champions', label: 'Champions', emoji: '🏆' },
  { id: 'f1', label: 'F1', emoji: '🏎️' },
  { id: 'motogp', label: 'MotoGP', emoji: '🏍️' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'nfl', label: 'NFL', emoji: '🏈' },
];
