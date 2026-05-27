import { createClient } from '@supabase/supabase-js';

// Estrazione dell'origine pulita per evitare corruzioni di percorso HTTP (PGRST125)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supaUrl = rawUrl ? new URL(rawUrl).origin : '';
const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supaUrl || !supaKey) {
  throw new Error("Variabili d'ambiente Supabase mancanti nel contesto Server.");
}

// Client inizializzato con Service Role per bypassare blocchi RLS lato server
export const supabaseServer = createClient(supaUrl, supaKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export interface FetchNewsParams {
  category?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export async function getNewsItems({ category, source, page = 1, limit = 20 }: FetchNewsParams = {}) {
  try {
    let queryBuilder = supabaseServer
      .from('news_items')
      .select('*', { count: 'exact' });

    // 1. GESTIONE KILLER FILTRO CATEGORIA (Evita il match letterale di "tutto")
    if (category && category.toLowerCase() !== 'tutto' && category.toLowerCase() !== 'all') {
      // Dizionario di mappatura se la colonna category_id sul DB è un intero
      const categoryMapping: Record<string, number> = {
        'calcio': 1,
        'f1': 2,
        'tennis': 3,
        'motogp': 4
      };

      const mappedId = categoryMapping[category.toLowerCase()];
      if (mappedId !== undefined) {
        queryBuilder = queryBuilder.eq('category_id', mappedId);
      } else {
        // Fallback se la colonna accetta direttamente stringhe minuscole
        queryBuilder = queryBuilder.eq('category_id', category.toLowerCase());
      }
    }

    // 2. GESTIONE KILLER FILTRO FONTE (Evita il match letterale di "tutte fonti")
    if (source && source.toLowerCase() !== 'tutte fonti' && source.toLowerCase() !== 'all') {
      queryBuilder = queryBuilder.eq('source', source);
    }

    // Pagaginazione e ordinamento temporale decrescente (recency)
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await queryBuilder
      .order('published_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      news: data || [],
      count: count || 0
    };
  } catch (err: any) {
    console.error("❌ Errore critico in getNewsItems:", err.message);
    return { news: [], count: 0 };
  }
}
