/**
 * lib/news.ts
 * Funzioni di lettura news dal DB con privilegi di servizio.
 */
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { NewsCardData } from '@/components/news/NewsCard';

interface AnyRow {
  id: unknown;
  hash?: unknown;
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
  // Se l'id primario bigint non è popolato, usa la stringa hash univoca inserita dal cron job
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
    category_name: r.category_name ? String(r.category_name) : String(r.category_id ?? ''),
    category_emoji: r.category_emoji ? String(r.category_emoji) : '📰',
  };
}

/** Ultime N notizie filtrate per categoria direttamente dalla tabella */
export async function fetchLatestNews(opts: { limit?: number; categoryId?: string } = {}): Promise<NewsCardData[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  try {
    let q = supabase
      .from('news_items')
      .select('id, hash, title, link, description, image_url, source_name, published_at, category_id')
      .order('published_at', { ascending: false })
      .limit(opts.limit ?? 30);
      
    if (opts.categoryId && opts.categoryId !== 'tutto') {
      q = q.eq('category_id', opts.categoryId);
    }
    
    const { data, error } = await q;
    if (error) {
      console.error("Errore fetchLatestNews Supabase:", error.message);
      return [];
    }
    return ((data ?? []) as AnyRow[]).map(toCard);
  } catch (err) {
    console.error("Errore critico fetchLatestNews:", err);
    return [];
  }
}

/** Paginazione cursor-based con filtri diretti */
export async function fetchNewsPage(opts: {
  limit?: number;
  before?: string | null;
  sourceId?: string;
  categoryId?: string;
}): Promise<NewsCardData[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    let q = supabase
      .from('news_items')
      .select('id, hash, title, link, description, image_url, source_name, published_at, category_id')
      .order('published_at', { ascending: false })
      .limit(opts.limit ?? 20);
    if (opts.before) q = q.lt('published_at', opts.before);
    if (opts.sourceId) q = q.eq('source_id', opts.sourceId);
    if (opts.categoryId && opts.categoryId !== 'tutto') q = q.eq('category_id', opts.categoryId);
    
    const { data, error } = await q;
    if (!error && data) return (data as AnyRow[]).map(toCard);
  } catch {}
  return [];
}

/** Ricerca full-text */
export async function searchNews(query: string, limit = 30): Promise<NewsCardData[]> {
  if (!query.trim()) return [];
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at')
    .ilike('title', `%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);
  return ((data ?? []) as AnyRow[]).map(toCard);
}

/** Notizia per id/hash */
export async function fetchNewsById(id: string): Promise<NewsCardData | null> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, description, image_url, source_name, published_at, category_id')
    .eq('hash', id)
    .maybeSingle();
  return data ? toCard(data as AnyRow) : null;
}

/** Bookmarks dell'utente corrente */
export async function fetchUserBookmarkIds(): Promise<Set<string>> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Set();

    const { data } = await supabase
      .from('news_bookmarks')
      .select('news_id')
      .eq('user_id', user.id);
    return new Set(((data ?? []) as { news_id: unknown }[]).map((r) => String(r.news_id)));
  } catch {
    return new Set();
  }
}

/** Ticker items (14 più recenti) */
export async function fetchTickerItems(): Promise<
  { id: string; title: string; link: string; source_name: string }[]
> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase
    .from('news_items')
    .select('id, hash, title, link, source_name')
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
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
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

/** Conteggi reali raggruppati per categoria dal database */
export async function fetchCategoryCounts(): Promise<Map<string, number>> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  try {
    const { data } = await supabase.from('news_items').select('category_id');
    const m = new Map<string, number>();
    (data ?? []).forEach((r: { category_id: unknown }) => {
      if (r.category_id) {
        const key = String(r.category_id);
        m.set(key, (m.get(key) ?? 0) + 1);
      }
    });
    return m;
  } catch {
    return new Map();
  }
}

/** Generazione delle categorie hardcoded per corrispondere alle tab del frontend */
export async function fetchCategories(): Promise<
  { id: string; name: string; short_name: string | null; emoji: string | null; sort_order: number }[]
> {
  return [
    { id: 'tutto', name: 'Tutto', short_name: 'Tutto', emoji: '📰', sort_order: 1 },
    { id: 'calcio', name: 'Calcio', short_name: 'Calcio', emoji: '⚽', sort_order: 2 },
    { id: 'f1', name: 'F1', short_name: 'F1', emoji: '🏎️', sort_order: 3 },
    { id: 'tennis', name: 'Tennis', short_name: 'Tennis', emoji: '🎾', sort_order: 4 },
    { id: 'motogp', name: 'MotoGP', short_name: 'MotoGP', emoji: '🏍️', sort_order: 5 }
  ];
}
