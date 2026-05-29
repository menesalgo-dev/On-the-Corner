/**
 * app/page.tsx — Home redesignata
 *
 * Identità: "uno sguardo veloce alla giornata sportiva".
 * Layout magazine: hero news + LiveStrip + sezione "In Evidenza" (3 col) +
 * CTA verso /live e /news.
 *
 * NON è una lista densa (quella sta in /news).
 */
import Link from 'next/link'
import { ArrowRight, Radio, Newspaper } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { LiveStrip } from '@/components/layout/LiveStrip'
import { SportShortcuts } from '@/components/shared/SportShortcuts'
import { fetchLatestNews } from '@/lib/news/items'
import { fetchLiveMatches, fetchMatchCountsByStatus } from '@/lib/sports/matches'
import type { NewsItemRow } from '@/lib/news/types'

export const revalidate = 120

export const metadata = {
  title: 'On The Corner — News e Live Sport',
  description: 'Lo sguardo veloce al mondo sportivo: news, live, schedine.',
}

export default async function HomePage() {
  const [hero, liveMatches, counts] = await Promise.all([
    fetchLatestNews({ limit: 7 }),
    fetchLiveMatches(8),
    fetchMatchCountsByStatus(),
  ])

  const heroMain = hero[0]
  const heroSide = hero.slice(1, 3)
  const evidenza = hero.slice(3, 7)

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        {/* TITOLO BENVENUTO */}
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

        {/* HERO BLOCK: 1 big + 2 small */}
        {heroMain && (
          <section className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <HeroBigCard news={heroMain} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {heroSide.map((n) => <HeroSideCard key={n.id} news={n} />)}
            </div>
          </section>
        )}

        {/* LIVESTRIP — sempre presente, cambia stato */}
        <section className="mb-6">
          <LiveStrip matches={liveMatches} />
        </section>

        {/* CTA verso /live se ci sono partite */}
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

        {/* SHORTCUTS sport */}
        <section className="mb-6">
          <SportShortcuts />
        </section>

        {/* IN EVIDENZA — 4 card piccole */}
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
              {evidenza.map((n) => <CompactCard key={n.id} news={n} />)}
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
                Apri l'archivio con filtri per categoria, fonte e data
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-zinc-500" />
        </Link>
      </main>

      <Footer />
      <BottomNav liveCount={counts.live} />
    </>
  )
}

/* ============================================================
 * HERO BIG: card grande con immagine in alto
 * ============================================================ */
function HeroBigCard({ news }: { news: NewsItemRow }) {
  return (
    <Link
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] transition hover:border-[#e8c800]/40 lg:col-span-2"
    >
      {news.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.image_url}
          alt=""
          className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.02]"
          loading="eager"
        />
      ) : (
        <div className="aspect-[16/9] w-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]" />
      )}
      <div className="p-4 sm:p-5">
        <CategoryTag category={news.category_id} source={news.source_name} />
        <h2
          className="mt-2 text-lg leading-tight text-white sm:text-2xl"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {news.title}
        </h2>
        {news.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{news.description}</p>
        )}
      </div>
    </Link>
  )
}

/* ============================================================
 * HERO SIDE: card laterale media
 * ============================================================ */
function HeroSideCard({ news }: { news: NewsItemRow }) {
  return (
    <Link
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-3 transition hover:border-[#e8c800]/40"
    >
      {news.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.image_url}
          alt=""
          className="h-20 w-24 shrink-0 rounded-lg object-cover sm:h-24 sm:w-32"
          loading="lazy"
        />
      ) : (
        <div className="h-20 w-24 shrink-0 rounded-lg bg-[#1a1a1a] sm:h-24 sm:w-32" />
      )}
      <div className="flex min-w-0 flex-col">
        <CategoryTag category={news.category_id} source={news.source_name} small />
        <h3 className="mt-1 line-clamp-3 text-sm leading-tight text-white sm:text-base">
          {news.title}
        </h3>
      </div>
    </Link>
  )
}

/* ============================================================
 * COMPACT CARD: card piccola per griglia "in evidenza"
 * ============================================================ */
function CompactCard({ news }: { news: NewsItemRow }) {
  return (
    <Link
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] transition hover:border-[#e8c800]/40"
    >
      {news.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.image_url}
          alt=""
          className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]" />
      )}
      <div className="p-3">
        <CategoryTag category={news.category_id} source={news.source_name} small />
        <h3 className="mt-1 line-clamp-2 text-sm leading-tight text-white">
          {news.title}
        </h3>
      </div>
    </Link>
  )
}

/* ============================================================
 * CATEGORY TAG con fonte
 * ============================================================ */
function CategoryTag({
  category, source, small,
}: { category: string; source: string | null; small?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 ${small ? 'text-[9px]' : 'text-[10px]'} uppercase tracking-widest`}
      style={{ fontFamily: 'var(--font-dm-mono)' }}
    >
      <span className="rounded bg-[#e8c800]/15 px-1.5 py-0.5 font-bold text-[#e8c800]">
        {category}
      </span>
      {source && <span className="truncate text-zinc-500">{source}</span>}
    </div>
  )
}
