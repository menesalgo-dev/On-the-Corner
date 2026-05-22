/**
 * lib/news.ts
 * Funzioni di lettura news dal DB con caching.
 * Tutte server-side. Usano il client Supabase con anon key (RLS attive).
 */
import 'server-only';
import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { NewsCardData } from '@/components/news/NewsCard';

/** Recupera le ultime N notizie ordinate per priorità+recency. */
export async function fetchLatestNews(limit = 30): Promise<NewsCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('news_items')
    .select('id, title, link, description, image_url, source_name, published_at')
    .order('priority', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[news] fetch failed:', error.message);
    return [];
  }
  return data as NewsCardData[];
}

/** Paginazione cursor-based: news più vecchie di `before` ISO. */
export async function fetchNewsPage(opts: {
  limit?: number;
  before?: string | null;
  sourceId?: string;
}): Promise<NewsCardData[]> {
  const supabase = await createClient();
  let q = supabase
    .from('news_items')
    .select('id, title, link, description, image_url, source_name, published_at')
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 20);

  if (opts.before) q = q.lt('published_at', opts.before);
  if (opts.sourceId) q = q.eq('source_id', opts.sourceId);

  const { data, error } = await q;
  if (error) {
    console.error('[news] page fetch failed:', error.message);
    return [];
  }
  return data as NewsCardData[];
}

/** Bookmarks dell'utente corrente (set di id). */
export async function fetchUserBookmarkIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('news_bookmarks')
    .select('news_id')
    .eq('user_id', user.id);

  return new Set((data ?? []).map((r: { news_id: string }) => r.news_id));
}

/** Conta tot. news per dashboard / panel "Statistiche". */
export const fetchNewsStats = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { count } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true });
    const { data: bySource } = await supabase
      .from('news_items')
      .select('source_id, source_name')
      .limit(1000);

    const sources = new Map<string, { name: string; count: number }>();
    (bySource ?? []).forEach((r: { source_id: string | null; source_name: string | null }) => {
      const key = (r.source_id ?? '') as string;
      const e = sources.get(key) ?? { name: (r.source_name ?? '') as string, count: 0 };
      e.count += 1;
      sources.set(key, e);
    });
    return {
      total: count ?? 0,
      sources: Array.from(sources, ([id, v]) => ({ id, ...v })).sort(
        (a, b) => b.count - a.count,
      ),
    };
  },
  ['news-stats'],
  { revalidate: 300, tags: ['news'] },
);
