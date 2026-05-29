/**
 * lib/news.ts
 * Funzioni di interazione diretta con la tabella news_items.
 * Modifica: rimossa categoria "fantacalcio" dalla lista fetchCategories.
 */
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supaUrl = rawUrl ? new URL(rawUrl).origin : '';
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supaUrl || !supaKey) {
  throw new Error("Variabili d'ambiente Supabase mancanti lato server.");
}

export const supabaseServer = createClient(supaUrl, supaKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

interface FetchNewsParams {
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}

/** Recupera l'elenco impaginato delle notizie applicando i filtri di UI */
export async function getNewsItems({ category, source, page = 1, limit = 20 }: FetchNewsParams = {}) {
  try {
    let queryBuilder = supabaseServer.from('news_items').select('*', { count: 'exact' });

    if (category && category.toLowerCase() !== 'tutto' && category.toLowerCase() !== 'all') {
      const categoryMapping: Record<string, number> = {
        'calcio': 1,
        'f1': 2,
        'tennis': 3,
        'motogp': 4,
      };
      const mappedId = categoryMapping[category.toLowerCase()];
      if (mappedId !== undefined) {
        queryBuilder = queryBuilder.or(`category_id.eq.${mappedId},category_id.eq.${category.toLowerCase()}`);
      } else {
        queryBuilder = queryBuilder.eq('category_id', category.toLowerCase());
      }
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

/** Recupera una singola notizia tramite hash */
export async function fetchNewsByHash(hash: string) {
  try {
    const { data, error } = await supabaseServer
      .from('news_items')
      .select('*')
      .eq('hash', hash)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error(`❌ Errore in fetchNewsByHash:`, err.message);
    return null;
  }
}

/** Recupera le ultime notizie inserite */
export async function fetchLatestNews({
  limit = 7,
  categoryId
}: {
  limit?: number;
  categoryId?: string
} = {}) {
  try {
    let query = supabaseServer
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false });

    if (categoryId && categoryId !== 'tutto') {
      query = query.eq('category_id', categoryId.toLowerCase().trim());
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("❌ Errore in fetchLatestNews:", err.message);
    return [];
  }
}

/** Recupera hash dei bookmark utente */
export async function fetchUserBookmarkHashes(): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseServer
      .from('news_bookmarks')
      .select('news_hash');

    if (error) throw error;
    return new Set((data || []).map((item: any) => item.news_hash).filter(Boolean));
  } catch (err: any) {
    console.error("❌ Errore in fetchUserBookmarkHashes:", err.message);
    return new Set();
  }
}

/**
 * Configurazione categorie per il frontend.
 * NB: rimossa "fantacalcio" come richiesto.
 */
export async function fetchCategories() {
  return [
    { id: 'tutto', name: 'Tutto', short_name: 'Tutto', emoji: '📰', sort_order: 1 },
    { id: 'calcio', name: 'Calcio', short_name: 'Calcio', emoji: '⚽', sort_order: 2 },
    { id: 'f1', name: 'F1', short_name: 'F1', emoji: '🏎️', sort_order: 3 },
    { id: 'tennis', name: 'Tennis', short_name: 'Tennis', emoji: '🎾', sort_order: 4 },
    { id: 'motogp', name: 'MotoGP', short_name: 'MotoGP', emoji: '🏍️', sort_order: 5 },
  ];
}

/** Conteggi dinamici per badge categorie */
export async function fetchCategoryCounts(): Promise<Map<string, number>> {
  try {
    const { data, error } = await supabaseServer
      .from('news_items')
      .select('category_id');

    if (error) throw error;

    const counts = new Map<string, number>();
    let total = 0;

    counts.set('tutto', 0);

    (data || []).forEach((row) => {
      const catId = String(row.category_id || '').toLowerCase().trim();
      // Escludi fantacalcio dai conteggi visibili (resta nel DB ma non mostrato)
      if (catId && catId !== 'fantacalcio') {
        counts.set(catId, (counts.get(catId) || 0) + 1);
        total++;
      }
    });

    counts.set('tutto', total);
    return counts;
  } catch (err) {
    console.error("❌ Errore in fetchCategoryCounts:", err);
    return new Map([['tutto', 0]]);
  }
}
