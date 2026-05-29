/**
 * app/page.tsx
 * Homepage Netflix-style con tab sport, hero campo SVG e righe scrollabili.
 */
import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchUserBookmarkHashes, getNewsItems } from '@/lib/news';
import { toNewsCardData } from '@/lib/news/types';
import { SportTabs } from '@/components/home/SportTabs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SPORTS = [
  { key: 'calcio',    label: 'Calcio',    emoji: '⚽' },
  { key: 'champions', label: 'Champions', emoji: '🏆' },
  { key: 'f1',        label: 'Formula 1', emoji: '🏎' },
  { key: 'motogp',    label: 'MotoGP',    emoji: '🏍' },
  { key: 'tennis',    label: 'Tennis',    emoji: '🎾' },
  { key: 'nfl',       label: 'NFL',       emoji: '🏈' },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { sport?: string };
}) {
  const activeSport = (searchParams?.sport ?? 'calcio') as string;

  const [allSportsData, bookmarkHashes] = await Promise.all([
    Promise.all(
      SPORTS.map(({ key }) =>
        getNewsItems({ category: key, limit: 8 }).then((res) =>
          (res.news ?? []).map((row: any) => toNewsCardData(row))
        )
      )
    ),
    fetchUserBookmarkHashes(),
  ]);

  const newsBySport = Object.fromEntries(
    SPORTS.map(({ key }, i) => [key, allSportsData[i] ?? []])
  );

  const activeSportConfig = SPORTS.find((s) => s.key === activeSport) ?? SPORTS[0];
  const activeNews = newsBySport[activeSport] ?? [];
  const heroItem = activeNews[0];
  const rowItems = activeNews.slice(1);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <Header />

      <main className="pb-24 sm:pb-12">

        {/* Tab sport */}
        <div className="mx-auto max-w-[1400px] px-4 pt-5 sm:px-6">
          <SportTabs sports={SPORTS as any} activeSport={activeSport} />
        </div>

        {/* Hero con campo SVG */}
        <div className="mx-auto max-w-[1400px] px-4 mt-4 sm:px-6">
          <div className="relative h-[300px] sm:h-[360px] rounded-xl overflow-hidden">
            <SportField sport={activeSport} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.1) 100%)',
              }}
            />
            {heroItem ? (
              <div className="absolute inset-0 flex items-center px-8">
                <div className="max-w-[55%]">
                  <span
                    className="inline-block mb-3 px-3 py-1 text-[9px] font-black tracking-widest uppercase rounded"
                    style={{ background: '#e8c800', color: '#080808' }}
                  >
                    {activeSportConfig!.emoji} {activeSportConfig!.label}
                  </span>
                  <h1
                    className="text-2xl sm:text-3xl font-black leading-tight mb-3 text-white"
                    style={{ fontFamily: 'var(--font-archivo-black)' }}
                  >
                    {heroItem.title}
                  </h1>
                  <p className="text-xs text-zinc-400 mb-5">
                    {heroItem.sourceName ?? heroItem.source}
                  </p>
                  <Link
                    href={`/news/${heroItem.id}`}
                    className="inline-block px-5 py-2.5 text-[10px] font-black tracking-widest uppercase rounded-md"
                    style={{ background: '#e8c800', color: '#080808' }}
                  >
                    Leggi articolo →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center px-8">
                <p className="text-sm text-zinc-500">Nessuna notizia disponibile.</p>
              </div>
            )}
          </div>
        </div>

        {/* Riga scrollabile sport attivo */}
        {rowItems.length > 0 && (
          <div className="mx-auto max-w-[1400px] px-4 mt-8 sm:px-6">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xs font-black tracking-widest uppercase"
                style={{ color: '#e8c800', fontFamily: 'var(--font-archivo-black)' }}
              >
                Ultime dal {activeSportConfig!.label}
              </h2>
              <Link
                href={`/sport/${activeSport}`}
                className="text-[10px] text-zinc-500 hover:text-white tracking-widest uppercase transition-colors"
              >
                Vedi tutte →
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
              {rowItems.map((item) => (
                <div key={item.id} className="flex-shrink-0 w-[220px] sm:w-[260px]">
                  <NewsCard
                    news={item}
                    isBookmarked={bookmarkHashes.has(item.id)}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Righe per gli altri sport */}
        {SPORTS.filter((s) => s.key !== activeSport).map(({ key, label, emoji }) => {
          const items = newsBySport[key] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={key} className="mx-auto max-w-[1400px] px-4 mt-10 sm:px-6">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xs font-black tracking-widest uppercase"
                  style={{ color: '#e8c800', fontFamily: 'var(--font-archivo-black)' }}
                >
                  {emoji} {label}
                </h2>
                <Link
                  href={`/sport/${key}`}
                  className="text-[10px] text-zinc-500 hover:text-white tracking-widest uppercase transition-colors"
                >
                  Vedi tutte →
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                {items.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-[220px] sm:w-[260px]">
                    <NewsCard
                      news={item}
                      isBookmarked={bookmarkHashes.has(item.id)}
                      variant="compact"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

function SportField({ sport }: { sport: string }) {
  switch (sport) {
    case 'calcio':
    case 'champions':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="360" fill="#0d2e0d" />
          {[0,1,2,3,4,5,6,7].map((i) => (
            <rect key={i} x={i*100} y="0" width="100" height="360" fill={i%2===0?'#0d2e0d':'#0f3510'} />
          ))}
          <rect x="40" y="30" width="720" height="300" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <line x1="400" y1="30" x2="400" y2="330" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle cx="400" cy="180" r="60" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle cx="400" cy="180" r="3" fill="rgba(255,255,255,0.2)" />
          <rect x="40" y="110" width="120" height="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <rect x="40" y="145" width="50" height="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <rect x="640" y="110" width="120" height="140" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <rect x="710" y="145" width="50" height="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        </svg>
      );
    case 'tennis':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="360" fill="#1a3a5c" />
          <rect x="60" y="40" width="680" height="280" fill="#1e4a70" />
          <rect x="60" y="40" width="680" height="280" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="230" y1="40" x2="230" y2="320" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <line x1="570" y1="40" x2="570" y2="320" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          <line x1="400" y1="40" x2="400" y2="320" stroke="rgba(255,255,255,0.22)" strokeWidth="3" />
          <line x1="60" y1="100" x2="740" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="60" y1="260" x2="740" y2="260" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="230" y1="180" x2="570" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        </svg>
      );
    case 'f1':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="360" fill="#1a0505" />
          <path d="M 150 280 Q 80 280 80 200 Q 80 120 150 120 L 500 120 Q 580 120 620 80 Q 680 30 720 80 Q 760 130 720 180 L 600 220 Q 550 240 550 280 L 150 280 Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="44" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 150 280 Q 80 280 80 200 Q 80 120 150 120 L 500 120 Q 580 120 620 80 Q 680 30 720 80 Q 760 130 720 180 L 600 220 Q 550 240 550 280 L 150 280 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'motogp':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="360" fill="#05051a" />
          <ellipse cx="400" cy="200" rx="300" ry="130" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="50" />
          <ellipse cx="400" cy="200" rx="300" ry="130" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <ellipse cx="400" cy="200" rx="250" ry="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>
      );
    case 'nfl':
      return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <rect width="800" height="360" fill="#051520" />
          {[0,1,2,3,4,5,6,7,8,9].map((i) => (
            <rect key={i} x={i*80} y="0" width="80" height="360" fill={i%2===0?'#051520':'#071825'} />
          ))}
          <rect x="30" y="30" width="740" height="300" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          {[1,2,3,4,5,6,7,8,9].map((i) => (
            <line key={i} x1={30+i*74} y1="30" x2={30+i*74} y2="330" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          ))}
          <rect x="30" y="30" width="74" height="300" fill="rgba(255,255,255,0.03)" />
          <rect x="696" y="30" width="74" height="300" fill="rgba(255,255,255,0.03)" />
          <line x1="400" y1="30" x2="400" y2="330" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        </svg>
      );
    default:
      return <div className="absolute inset-0 bg-zinc-900" />;
  }
}
