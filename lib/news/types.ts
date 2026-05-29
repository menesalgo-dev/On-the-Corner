/**
 * lib/news/types.ts
 * Tipi strutturati flessibili per garantire la tolleranza totale tra snake_case e camelCase.
 * Contiene le utility di normalizzazione integrate per evitare dipendenze incrociate.
 */

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
 */
export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
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
 * Adapter — Mappa i dati in modo intelligente popolando ENTRAMBI i formati (snake e camel).
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
   UTILITIES DI NORMALIZZAZIONE INTEGRATE (Risolve definitivamente run-sync, gnews, parser)
   ========================================================================== */

export function similarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const str1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const str2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (str1 === str2) return 1;
  if (str1.length < 2 || str2.length < 2) return 0;

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < str1.length - 1; i++) {
    const bigram = str1.substr(i, 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < str2.length - 1; i++) {
    const bigram = str2.substr(i, 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (str1.length + str2.length - 2);
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title.trim().replace(/\s+/g, ' ');
}

export function normalizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, '');
  }
}

export function sha1(str: string): string {
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha1').update(str).digest('hex');
  } catch {
    let block1 = 0, block2 = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      block1 = (block1 * 31 + ch) | 0;
      block2 = (block2 * 37 + ch) | 0;
    }
    return Math.abs(block1).toString(16) + Math.abs(block2).toString(16);
  }
}
