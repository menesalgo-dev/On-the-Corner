import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supaUrl = rawUrl ? new URL(rawUrl).origin : '';
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supaUrl || !supaKey) {
  throw new Error("Variabili d'ambiente Supabase mancanti lato server.");
}

export const supabaseServer = createClient(supaUrl, supaKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

interface FetchNewsParams {
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export async function getNewsItems({ category, source, page = 1, limit = 20 }: FetchNewsParams = {}) {
  try {
    let queryBuilder = supabaseServer.from('news_items').select('*', { count: 'exact' });

    if (category && category.toLowerCase() !== 'tutto' && category.toLowerCase() !== 'all') {
      const categoryMapping: Record<string, number> = { 'calcio': 1, 'f1': 2, 'tennis': 3, 'motogp': 4 };
      const mappedId = categoryMapping[category.toLowerCase()];
      if (mappedId !== undefined) queryBuilder = queryBuilder.eq('category_id', mappedId);
    }

    if (source && source.toLowerCase() !== 'tutte fonti' && source.toLowerCase() !== 'all') {
      queryBuilder = queryBuilder.eq('source_name', source);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await queryBuilder
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { news: data || [], count: count || 0 };
  } catch (err: any) {
    console.error("❌ Errore in getNewsItems:", err.message);
    return { news: [], count: 0 };
  }
}

export async function fetchNewsByHash(hash: string) {
  const { data } = await supabaseServer.from('news_items').select('*').eq('hash', hash).maybeSingle();
  return data;
}

export async function fetchLatestNews({ limit = 6 }: { limit?: number } = {}) {
  const { data } = await supabaseServer.from('news_items').select('*').order('published_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function fetchUserBookmarkHashes(): Promise<Set<string>> {
  const { data } = await supabaseServer.from('news_bookmarks').select('news_hash');
  return new Set((data || []).map((b: any) => b.news_hash));
}
