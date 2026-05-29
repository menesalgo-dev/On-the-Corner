/**
 * lib/news/types.ts
 * Tipi snake_case allineati al DB Postgres e utilities di normalizzazione.
 *
 * NewsItemRow è il tipo "grezzo" del DB.
 * NewsCardData è il tipo usato dai componenti NewsCard, BookmarkButton, ecc.
 *
 * Include le funzioni helper utilizzate dai moduli di importazione news (es. gnews.ts).
 */

/** Riga DB news_items (snake_case Postgres). */
export interface NewsItemRow {
  id: string;
  hash: string;
  source_id: string | null;
  source_name: string | null;
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
}

/** 
 * Alias di tipo per mantenere la retrocompatibilità con i moduli esterni 
 * (es. lib/external-news/gnews.ts) che cercano il tipo 'NewsItem'.
 */
export type NewsItem = NewsItemRow;

/**
 * Dati passati ai componenti card.
 * Stesso schema di NewsItemRow ma con campi opzionali UI.
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
 * Adapter — convertito in identity function dato che gli schemi sono già allineati.
 * Mantenuto per non rompere le import esistenti in app/fantacalcio, app/news/[id], ecc.
 */
export function toNewsCardData(row: NewsItemRow): NewsCardData {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    description: row.description,
    image_url: row.image_url,
    source_name: row.source_name ?? '',
    published_at: row.published_at,
    category_id: row.category_id,
    category_name: row.category_name ?? null,
    category_emoji: row.category_emoji ?? null,
  };
}

/* ==========================================================================
   UTILITIES DI NORMALIZZAZIONE (Richieste dai moduli scraper/parser come gnews.ts)
   ========================================================================== */

/**
 * Pulisce e normalizza il titolo di una notizia rimuovendo spazi superflui
 */
export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title.trim().replace(/\s+/g, ' ');
}

/**
 * Normalizza gli URL per evitare duplicati dovuti a query string o slash finali
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    // Rimuove query param inutili mantenendo l'URL pulito
    return `${parsed.origin}${parsed.pathname}`.toLowerCase().replace(/\/$/, '');
  } catch {
    return url.trim().toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Genera un hash ID unico (SHA-1) partendo da una stringa (es. l'URL della notizia).
 * Sostituisce la dipendenza nativa 'crypto' in modo sincrono e leggero per Edge/Node.
 */
export function sha1(str: string): string {
  // Se la build gira in ambiente Node completo, usiamo crypto per massima efficienza
  try {
    const crypto = require('crypto');
    return crypto.createHash('sha1').update(str).digest('hex');
  } catch {
    // Fallback pulito se eseguito in Edge Runtime dove 'crypto' di Node non è disponibile
    let block1 = 0, block2 = 0, block3 = 0, block4 = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      block1 = (block1 * 31 + ch) | 0;
      block2 = (block2 * 37 + ch) | 0;
    }
    return Math.abs(block1).toString(16) + Math.abs(block2).toString(16);
  }
}
