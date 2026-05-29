/**
 * lib/news/items.ts
 * Lettura news dal DB per home e archivio.
 */
import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { NewsItemRow } from './types'

/** Ultime news per home (compact). */
export async function fetchLatestNews(opts: { limit?: number; categoryId?: string } = {}): Promise<NewsItemRow[]> {
  const { limit = 8, categoryId } = opts
  const supabase = await createClient()
  let q = supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit)
  if (categoryId) q = q.eq('category_id', categoryId)
  const { data } = await q
  return (data ?? []) as NewsItemRow[]
}

/** Archivio paginato per pagina /news. */
export async function fetchNewsArchive(opts: {
  page?: number
  pageSize?: number
  categoryId?: string
  sourceId?: string
  countOnly?: true
}): Promise<NewsItemRow[] | number> {
  const { page = 1, pageSize = 20, categoryId, sourceId, countOnly } = opts
  const supabase = await createClient()

  if (countOnly) {
    let q = supabase.from('news_items').select('id', { count: 'exact', head: true })
    if (categoryId) q = q.eq('category_id', categoryId)
    if (sourceId) q = q.eq('source_id', sourceId)
    const { count } = await q
    return count ?? 0
  }

  const offset = (page - 1) * pageSize
  let q = supabase
    .from('news_items')
    .select('*')
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
  if (categoryId) q = q.eq('category_id', categoryId)
  if (sourceId) q = q.eq('source_id', sourceId)
  const { data } = await q
  return (data ?? []) as NewsItemRow[]
}

/** Conteggio articoli per categoria (per filtro chips). */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const supabase = await createClient()
  // Postgres aggregation via RPC: se non esiste la funzione, usa fallback con select
  const { data, error } = await supabase.rpc('news_count_by_category')
  if (!error && Array.isArray(data)) {
    const map: Record<string, number> = {}
    data.forEach((r: { category_id: string; cnt: number }) => {
      map[r.category_id] = Number(r.cnt)
    })
    return map
  }

  // Fallback: scarica e conta in memoria (limitato a 1000 righe)
  const { data: rows } = await supabase
    .from('news_items')
    .select('category_id')
    .limit(1000)
  const map: Record<string, number> = {}
  ;(rows ?? []).forEach((r: { category_id: string | null }) => {
    const c = r.category_id ?? 'altro'
    map[c] = (map[c] ?? 0) + 1
  })
  return map
}
