/**
 * lib/news/types.ts
 * Tipi strutturati flessibili per garantire la tolleranza totale tra snake_case e camelCase.
 * Fa da ponte (re-export) verso `@/lib/utils` per mantenere intatti gli import del progetto.
 */
import { 
  similarity as utilSimilarity, 
  stripHtml as utilStripHtml, 
  normalizeTitle as utilNormalizeTitle, 
  normalizeUrl as utilNormalizeUrl, 
  sha1 as utilSha1 
} from '@/lib/utils';

/** Struttura base rigida del DB news_items (Postgres standard) */
export interface BaseNewsItemRow {
  id: string;
  hash: string;
  source_id: string | null;
  source_name: string | null;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  lang: string;
  priority: number; // Forzato numerico per evitare errori logici e NaN nei cicli .sort()
  published_at: string;
  tags: string[] | null;
  category_id: string;
  category_name?: string | null;
  category_emoji?: string | null;
  created_at: string;
}

/**
 * Estensione combinata con i campi camelCase alternativi.
 * Il Partial permette agli oggetti incompleti degli scraper (es. gnews.ts) di compilare senza errori.
 */
export type NewsItemRow = Partial<Omit<BaseNewsItemRow, 'priority'>> & {
  hash: string;
  title: string;
  link: string;
  priority: number; 
} & Partial<{
  id: string;
  sourceId: string | null;
  sourceName: string | null;
  imageUrl: string | null;
  publishedAt: string; 
  categoryId: string | null;
  lang: string;
  tags: string[] | null;
}>;

/**
 * Alias di tipo per mantenere la piena retrocompatibilità.
 */
export type NewsItem = NewsItemRow;

/**
 * Dati rigidi passati ai componenti d'interfaccia (NewsCard, ecc.)
 */
export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  published_at: string;
  category_id?: string | null;
  category_name?: string | null;
  category_emoji?: string | null;
}

/**
 * Adapter — Mappa i dati in modo intelligente estraendo i valori
 * sia che l'oggetto di origine sia in formato snake_case, sia in camelCase.
 */
export function toNewsCardData(row: NewsItemRow): NewsCardData {
  return {
    id: row.id || row.hash || '', 
    title: row.title || '',
    link: row.link || '',
    description: row.description || null,
    image_url: row.image_url || row.imageUrl || null,
    source_name: row.source_name || row.sourceName || 'On The Corner',
    published_at: row.published_at || row.publishedAt || new Date().toISOString(),
    category_id: row.category_id || row.categoryId || 'generale',
    category_name: row.category_name ?? null,
    category_emoji: row.category_emoji ?? null,
  };
}

/* ==========================================================================
   PONTE DI ESPORTAZIONE VERSO UTILS (Risolve gli import di gnews, parser, run-sync)
   ========================================================================== */

export const similarity = utilSimilarity;
export const stripHtml = utilStripHtml;
export const normalizeTitle = utilNormalizeTitle;
export const normalizeUrl = utilNormalizeUrl;
export const sha1 = utilSha1;
