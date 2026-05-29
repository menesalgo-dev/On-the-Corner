/**
 * app/news/page.tsx — Archivio news
 *
 * Identità: "lista densa per ricercare e sfogliare".
 * Layout: filtri sticky in alto + lista verticale densa + paginazione.
 *
 * NON è la home (quella è una sintesi). Qui c'è tutto, ordinato, filtrabile.
 */
import Link from 'next/link'
import { Search, Filter, ChevronLeft, Home as HomeIcon } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { fetchNewsArchive, fetchCategoryCounts } from '@/lib/news/items'
import { fetchMatchCountsByStatus } from '@/lib/sports/matches'
import type { NewsItemRow } from '@/lib/news/types'

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    category?: string
    source?: string
    page?: string
  }>
}

const PAGE_SIZE = 20

export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams
  const cat = params.category
  return {
    title: cat ? `News ${cat} — On The Corner` : 'Archivio news sportive',
    description: 'Tutte le notizie sportive aggiornate ogni 30 minuti.',
  }
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1') || 1)
  const category = params.category
  const sourceId = params.source

  const [itemsRaw, total, categoryCounts, matchCounts] = await Promise.all([
    fetchNewsArchive({ page, pageSize: PAGE_SIZE, categoryId: category, sourceId }),
    fetchNewsArchive({ countOnly: true, categoryId: category, sourceId }),
    fetchCategoryCounts(),
    fetchMatchCountsByStatus(),
  ])

  const items: NewsItemRow[] = Array.isArray(itemsRaw) ? itemsRaw : []
  const totalCount = typeof total === 'number' ? total : 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        {/* Breadcrumb + back to home (importante per mobile) */}
        <nav className="mb-3 flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-[#e8c800]"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span
            className="uppercase tracking-widest text-zinc-300"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Archivio
          </span>
        </nav>

        {/* Header pagina con totali */}
        <header className="mb-4 flex items-baseline justify-between">
          <div>
            <h1
              className="text-2xl uppercase tracking-tight sm:text-4xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {category ? category : 'Tutte'}<span className="text-[#e8c800]">.</span>
            </h1>
            <p
              className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              {totalCount} articoli · pagina {page}/{totalPages}
            </p>
          </div>
        </header>

        {/* Filtri categoria — chips orizzontali scrollabili */}
        <CategoryFilter activeCategory={category} categoryCounts={categoryCounts} />

        {/* Lista densa */}
        {items.length === 0 ? (
          <EmptyResults />
        ) : (
          <div className="divide-y divide-[#1f1f1f] rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] overflow-hidden">
            {items.map((n, idx) => (
              <NewsRow key={n.id} news={n} index={(page - 1) * PAGE_SIZE + idx + 1} />
            ))}
          </div>
        )}

        {/* Paginazione */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} category={category} />
        )}

        {/* CTA torna alla home (extra collegamento mobile) */}
        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] py-3 text-xs uppercase tracking-widest text-zinc-400 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          <ChevronLeft className="h-4 w-4" />
          Torna alla home
        </Link>
      </main>

      <Footer />
      <BottomNav liveCount={matchCounts.live} />
    </>
  )
}

/* ============================================================
 * NEWS ROW: lista densa orizzontale
 * ============================================================ */
function NewsRow({ news, index }: { news: NewsItemRow; index: number }) {
  return (
    <Link
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 transition hover:bg-[#141414] sm:gap-4 sm:p-4"
    >
      {/* Numero ordinale a sinistra */}
      <div
        className="hidden w-8 shrink-0 text-right text-[10px] uppercase tracking-widest text-zinc-700 sm:block"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {String(index).padStart(2, '0')}
      </div>

      {/* Immagine */}
      {news.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={news.image_url}
          alt=""
          className="h-16 w-20 shrink-0 rounded-lg object-cover sm:h-20 sm:w-28"
          loading="lazy"
        />
      ) : (
        <div className="h-16 w-20 shrink-0 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] sm:h-20 sm:w-28" />
      )}

      {/* Contenuto */}
      <div className="flex min-w-0 flex-col justify-between">
        <div>
          <div
            className="flex items-center gap-2 text-[9px] uppercase tracking-widest sm:text-[10px]"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            <span className="rounded bg-[#e8c800]/15 px-1.5 py-0.5 font-bold text-[#e8c800]">
              {news.category_id}
            </span>
            {news.source_name && (
              <span className="truncate text-zinc-500">{news.source_name}</span>
            )}
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm leading-tight text-white sm:text-base">
            {news.title}
          </h3>
        </div>
        <time
          className="text-[10px] uppercase tracking-widest text-zinc-600"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
          dateTime={news.published_at}
        >
          {timeAgo(news.published_at)}
        </time>
      </div>
    </Link>
  )
}

/* ============================================================
 * CATEGORY FILTER chips
 * ============================================================ */
function CategoryFilter({
  activeCategory, categoryCounts,
}: { activeCategory?: string; categoryCounts: Record<string, number> }) {
  const cats: { id: string | undefined; label: string }[] = [
    { id: undefined, label: 'Tutte' },
    { id: 'calcio', label: '⚽ Calcio' },
    { id: 'champions', label: '🏆 Champions' },
    { id: 'f1', label: '🏎️ F1' },
    { id: 'motogp', label: '🏍️ MotoGP' },
    { id: 'tennis', label: '🎾 Tennis' },
    { id: 'nfl', label: '🏈 NFL' },
    { id: 'fantacalcio', label: '🎮 Fanta' },
    { id: 'altro', label: '📰 Altro' },
  ]

  return (
    <nav className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
      {cats.map((c) => {
        const active = c.id === activeCategory
        const count = c.id
          ? (categoryCounts[c.id] ?? 0)
          : Object.values(categoryCounts).reduce((s, n) => s + n, 0)
        return (
          <Link
            key={c.id ?? 'all'}
            href={c.id ? `/news?category=${c.id}` : '/news'}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              active
                ? 'border-[#e8c800] bg-[#e8c800] text-black'
                : 'border-[#1f1f1f] bg-[#0d0d0d] text-zinc-400 hover:border-[#e8c800]/40 hover:text-[#e8c800]'
            }`}
          >
            {c.label}
            {count > 0 && (
              <span className={`ml-1.5 ${active ? 'text-black/60' : 'text-zinc-600'}`}>
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

/* ============================================================
 * PAGINAZIONE
 * ============================================================ */
function Pagination({
  page, totalPages, category,
}: { page: number; totalPages: number; category?: string }) {
  const baseQs = category ? `category=${category}&` : ''
  const prevHref = page > 1 ? `/news?${baseQs}page=${page - 1}` : null
  const nextHref = page < totalPages ? `/news?${baseQs}page=${page + 1}` : null

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      {prevHref ? (
        <Link
          href={prevHref}
          className="rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          ← Precedente
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          ← Precedente
        </span>
      )}
      <span
        className="px-3 text-xs uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {page} / {totalPages}
      </span>
      {nextHref ? (
        <Link
          href={nextHref}
          className="rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Successivo →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] px-4 py-2 text-xs uppercase tracking-wider text-zinc-700">
          Successivo →
        </span>
      )}
    </nav>
  )
}

/* ============================================================
 * EMPTY STATE
 * ============================================================ */
function EmptyResults() {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-10 text-center">
      <Search className="mx-auto h-8 w-8 text-zinc-600" />
      <h2 className="mt-3 text-lg uppercase text-white" style={{ fontFamily: 'var(--font-archivo-black)' }}>
        Nessuna notizia
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        Per questa categoria non ci sono articoli recenti.
      </p>
      <Link
        href="/news"
        className="mt-4 inline-block rounded-lg bg-[#e8c800] px-4 py-2 text-xs uppercase tracking-wider text-black"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        Vedi tutte
      </Link>
    </div>
  )
}

/* ============================================================
 * UTILS
 * ============================================================ */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'ora'
  if (min < 60) return `${min} min fa`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h fa`
  const d = Math.floor(h / 24)
  return `${d} g fa`
}
