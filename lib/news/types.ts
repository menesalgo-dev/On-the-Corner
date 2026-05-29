/**
 * lib/news/types.ts
 * Tipi strutturati per garantire la massima tolleranza tra snake_case e camelCase.
 * Risolve gli errori di compilazione nei moduli esterni (es. gnews.ts) senza modificarli.
 */

/** Riga DB news_items e mappatura flessibile per parser esterni. */
export interface NewsItemRow {
  id: string;
  hash: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  lang: string;
  priority: number | null;
  published_at: string;
  tags: string[] | null;
  category_id: string;
  category_name?: string | null;
  category_emoji?: string | null;
  created_at: string;

  // Standard Database (snake_case)
  source_id: string | null;
  source_name: string | null;

  // Supporto Retrocompatibilità (camelCase per gnews.ts e vecchi script)
  // Definiti come opzionali per accettare oggetti scritti in entrambi i modi
  sourceId?: string | null;
  sourceName?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  categoryId?: string | null;
}

/** 
 * Alias di tipo richiesto da moduli terzi (es. lib/external-news/gnews.ts)
 */
export type NewsItem = NewsItemRow;

/**
 * Dati passati ai componenti card della UI.
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
 * sia che l'oggetto di origine sia in snake_case sia in camelCase.
 */
export function toNewsCardData(row: NewsItemRow): NewsCardData {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    description: row.description,
    // Recupera il valore indipendentemente dal formato del campo sorgente
    image_url: row.image_url || (row as any).imageUrl || null,
    source_name: row.source_name || (row as any).sourceName || '',
    published_at: row.published_at || (row as any).publishedAt || '',
    category_id: row.category_id || (row as any).categoryId || null,
    category_name: row.category_name ?? null,
    category_emoji: row.category_emoji ?? null,
  };
}

/* ==========================================================================
   UTILITIES DI NORMALIZZAZIONE (Richieste dai moduli scraper/parser come gnews.ts)
   ========================================================================== */

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
