/**
 * lib/news.ts
 * Funzioni di lettura news dal DB con caching.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { NewsCardData } from '@/components/news/NewsCard';

interface AnyRow {
  id: unknown;
  hash?: unknown; // ✅ Aggiunto l'hash nel tipo
  title: unknown;
  link: unknown;
  description: unknown;
  image_url: unknown;
  source_name: unknown;
  published_at: unknown;
  category_id?: unknown;
  category_name?: unknown;
  category_emoji?: unknown;
}

function toCard(r: AnyRow): NewsCardData {
  // ✅ CORREZIONE: Se r.id non esiste o è vuoto, usa la colonna r.hash inserita dallo script di sincronizzazione
  const finalId = r.id ? String(r.id) : (r.hash ? String(r.hash) : '');

  return {
    id: finalId,
    title: String(r.title ?? ''),
    link: String(r.link ?? ''),
    description: r.description ? String(r.description) : null,
    image_url: r.image_url ? String(r.image_url) : null,
    source_name: String(r.source_name ?? ''),
    published_at: String(r.published_at ?? ''),
    category_id: r.category_id ? String(r.category_id) : null,
    category_name: r.category_name ? String(r.category_name) : null,
    category_emoji: r.category_emoji ? String(r.category_emoji) : null,
  };
}

/** Ultime N notizie, opzionalmente filtrate per categoria. */
export async function fetchLatestNews(opts: { limit?: number; categoryId?: string } = {}): Promise<NewsCardData[]> {
  const supabase = await createClient();
  try {
    let q = supabase
      .from('news_with_category')
      .select('id, hash, title, link, description, image_url, source_name, published_at, category_id, category_name, category_emoji') // ✅ Richiesto anche hash
      .order('priority', { ascending: true })
      .order('published_at', { ascending: false })
      .limit(opts.limit ?? 30);
    if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
    const { data, error } = await q;
    if (!error && data) return (data as AnyRow[]).map(toCard);
  } catch {
    // ignore
  }

  // Fallback sulla tabella principale
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at') // ✅ Richiesto anche hash
    .order('priority', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 30);
  return ((data ?? []) as AnyRow[]).map(toCard);
}

/** Paginazione cursor-based con filtri. */
export async function fetchNewsPage(opts: {
  limit?: number;
  before?: string | null;
  sourceId?: string;
  categoryId?: string;
}): Promise<NewsCardData[]> {
  const supabase = await createClient();
  try {
    let q = supabase
      .from('news_with_category')
      .select('id, hash, title, link, description, image_url, source_name, published_at, category_id, category_name, category_emoji, priority, source_id')
      .order('published_at', { ascending: false })
      .limit(opts.limit ?? 20);
    if (opts.before) q = q.lt('published_at', opts.before);
    if (opts.sourceId) q = q.eq('source_id', opts.sourceId);
    if (opts.categoryId) q = q.eq('category_id', opts.categoryId);
    const { data, error } = await q;
    if (!error && data) return (data as AnyRow[]).map(toCard);
  } catch {}

  let q = supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at')
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 20);
  if (opts.before) q = q.lt('published_at', opts.before);
  if (opts.sourceId) q = q.eq('source_id', opts.sourceId);
  const { data } = await q;
  return ((data ?? []) as AnyRow[]).map(toCard);
}

/** Ricerca full-text */
export async function searchNews(query: string, limit = 30): Promise<NewsCardData[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at')
    .ilike('title', `%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);
  return ((data ?? []) as AnyRow[]).map(toCard);
}

/** Notizia per id (per /news/[id]) */
export async function fetchNewsById(id: string): Promise<NewsCardData | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at')
    .eq('hash', id) // ✅ Cerca per hash se l'id non è mappato primario
    .maybeSingle();
  return data ? toCard(data as AnyRow) : null;
}

/** Bookmarks dell'utente corrente */
export async function fetchUserBookmarkIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('news_bookmarks')
    .select('news_id')
    .eq('user_id', user.id);
  return new Set(((data ?? []) as { news_id: unknown }[]).map((r) => String(r.news_id)));
}

/** Ticker items (14 più recenti) */
export async function fetchTickerItems(): Promise<
  { id: string; title: string; link: string; source_name: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, source_name')
    .order('priority', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(14);
  return ((data ?? []) as AnyRow[]).map((r) => ({
    id: r.id ? String(r.id) : (r.hash ? String(r.hash) : ''),
    title: String(r.title ?? ''),
    link: String(r.link ?? ''),
    source_name: String(r.source_name ?? ''),
  }));
}

/** Stat per sidebar: totali + per fonte */
export async function fetchNewsStats(): Promise<{
  total: number;
  sources: { id: string; name: string; count: number }[];
}> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true });
  const { data: bySource } = await supabase
    .from('news_items')
    .select('source_id, source_name')
    .limit(1000);

  const sources = new Map<string, { name: string; count: number }>();
  (bySource ?? []).forEach((r: { source_id: unknown; source_name: unknown }) => {
    const key = String(r.source_id ?? '');
    if (!key) return;
    const e = sources.get(key) ?? { name: String(r.source_name ?? ''), count: 0 };
    e.count += 1;
    sources.set(key, e);
  });
  return {
    total: count ?? 0,
    sources: Array.from(sources, ([id, v]) => ({ id, ...v })).sort((a, b) => b.count - a.count),
  };
}

/** Conteggi per categoria */
export async function fetchCategoryCounts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  try {
    const { data } = await supabase.rpc('news_count_by_category');
    const m = new Map<string, number>();
    (data ?? []).forEach((r: { category_id: unknown; count: unknown }) => {
      if (r.category_id) m.set(String(r.category_id), Number(r.count));
    });
    return m;
  } catch {
    return new Map();
  }
}

/** Categorie configurate */
export async function fetchCategories(): Promise<
  { id: string; name: string; short_name: string | null; emoji: string | null; sort_order: number }[]
> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, short_name, emoji, sort_order')
      .neq('id', 'altro')
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((r: { id: unknown; name: unknown; short_name: unknown; emoji: unknown; sort_order: unknown }) => ({
      id: String(r.id),
      name: String(r.name ?? ''),
      short_name: r.short_name ? String(r.short_name) : null,
      emoji: r.emoji ? String(r.emoji) : null,
      sort_order: Number(r.sort_order ?? 100),
    }));
  } catch {
    return [];
  }
}
