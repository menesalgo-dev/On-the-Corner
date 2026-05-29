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
 * Tipo esteso per gli scraper esterni (gnews, parser).
 * Unisce i campi base del database con le proprietà camelCase alternative.
 */
export type ExtendedNewsFields = {
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
 * Esportazione combinata finale del Tipo per il DB e gli scraper.
 */
export type NewsItemRow = Partial<Omit<BaseNewsItemRow, 'priority'>> & ExtendedNewsFields;

/**
 * Alias di tipo per mantenere la piena retrocompatibilità.
 */
export type NewsItem = NewsItemRow;

/**
 * Dati flessibili passati ai componenti d'interfaccia (NewsCard, Detail Page, ecc.)
 * Supporta sia lo standard snake_case che il vecchio camelCase per evitare conflitti nella UI.
 */
export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
  
  // Standard UI (Doppio supporto snake_case e camelCase)
  image_url: string | null;
  imageUrl?: string | null;
  
  source_name: string;
  sourceName?: string;
  
  published_at: string;
  publishedAt?: string;
  
  category_id?: string | null;
  categoryId?: string | null;
  
  category_name?: string | null;
  category_emoji?: string | null;
}

/**
 * Adapter — Mappa i dati in modo intelligente popolando ENTRAMBI i formati (snake e camel),
 * così qualsiasi componente UI funzionerà istantaneamente a prescindere da cosa stampi a video.
 */
export function toNewsCardData(row: any): NewsCardData {
  const img = row.image_url || row.imageUrl || null;
  const src = row.source_name || row.sourceName || 'On The Corner';
  const pub = row.published_at || row.publishedAt || new Date().toISOString();
  const catId = row.category_id || row.categoryId || 'generale';

  return {
    id: row.id || row.hash || '', 
    title: row.title || '',
    link: row.link || '',
    description: row.description || null,
    category_name: row.category_name ?? null,
    category_emoji: row.category_emoji ?? null,
    
    // Popoliamo sia le chiavi snake_case che camelCase per garantire compatibilità totale
    image_url: img,
    imageUrl: img,
    source_name: src,
    sourceName: src,
    published_at: pub,
    publishedAt: pub,
    category_id: catId,
    categoryId: catId
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
