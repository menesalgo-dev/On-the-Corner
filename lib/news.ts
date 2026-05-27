/**
 * lib/news.ts
 * Funzioni di interazione diretta con la tabella news_items.
 * Utilizza la Service Role Key per escludere blocchi RLS nel contesto server.
 */
import { createClient } from '@supabase/supabase-js';

// Estrazione dell'origine pulita per evitare corruzioni nei percorsi HTTP (PGRST125)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supaUrl = rawUrl ? new URL(rawUrl).origin : '';
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supaUrl || !supaKey) {
  throw new Error("Variabili d'ambiente Supabase mancanti lato server.");
}

// Client privilegiato per operazioni sicure server-side
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

/**
 * Recupera l'elenco impaginato delle notizie applicando i filtri di UI.
 * Adotta un approccio ibrido e flessibile (ricerca OR) per intercettare sia gli ID numerici
 * sia i tag testuali salvati nella colonna category_id del database.
 */
export async function getNewsItems({ category, source, page = 1, limit = 20 }: FetchNewsParams = {}) {
  try {
    let queryBuilder = supabaseServer.from('news_items').select('*', { count: 'exact' });

    // FILTRO CATEGORIA IBRIDO E SICURO (Evita il match letterale errato di "tutto")
    if (category && category.toLowerCase() !== 'tutto' && category.toLowerCase() !== 'all') {
      const categoryMapping: Record<string, number> = { 
        'calcio': 1, 
        'f1': 2, 
        'tennis': 3, 
        'motogp': 4,
        'Fantacalcio': 5
      };
      
      const mappedId = categoryMapping[category.toLowerCase()];
      
      if (mappedId !== undefined) {
        // Cerca sia l'ID numerico (1, 2, 3...) sia la stringa testuale esatta ('calcio', 'f1'...)
        queryBuilder = queryBuilder.or(`category_id.eq.${mappedId},category_id.eq.${category.toLowerCase()}`);
      } else {
        queryBuilder = queryBuilder.eq('category_id', category.toLowerCase());
      }
    }

    // GESTIONE FILTRO FONTE
    if (source && source.toLowerCase() !== 'tutte fonti' && source.toLowerCase() !== 'all') {
      queryBuilder = queryBuilder.eq('source_name', source);
    }

    // Calcolo del range di paginazione nativo per PostgreSQL
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

/**
 * Recupera una singola notizia partendo dal suo hash SHA-1 (Chiave logica di riferimento)
 */
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
    console.error(`❌ Errore in fetchNewsByHash per hash ${hash}:`, err.message);
    return null;
  }
}

/**
 * Recupera le ultime notizie inserite senza filtri sportivi (es. per widget o correlate)
 */
export async function fetchLatestNews({ limit = 6 }: { limit?: number } = {}) {
  try {
    const { data, error } = await supabaseServer
      .from('news_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("❌ Errore in fetchLatestNews:", err.message);
    return [];
  }
}

/**
 * Recupera l'elenco di tutti gli hash delle notizie salvate dall'utente corrente.
 * Ritorna un oggetto Set<string> per ricerche istantanee con .has() sul frontend.
 */
export async function fetchUserBookmarkHashes(): Promise<Set<string>> {
  try {
    const { data, error } = await supabaseServer
      .from('news_bookmarks')
      .select('news_hash');

    if (error) throw error;

    const hashSet = new Set<string>();
    if (data) {
      data.forEach((item: any) => {
        if (item.news_hash) hashSet.add(item.news_hash);
      });
    }
    return hashSet;
  } catch (err: any) {
    console.error("❌ Errore in fetchUserBookmarkHashes:", err.message);
    return new Set<string>();
  }
}
