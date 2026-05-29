/**
 * lib/news/types.ts
 * Tipi snake_case allineati al DB Postgres e al codice esistente.
 *
 * NewsItemRow è il tipo "grezzo" del DB.
 * NewsCardData è il tipo usato dai componenti NewsCard, BookmarkButton, ecc.
 * Sono praticamente identici, ma NewsCardData è specifico per UI (immutabile).
 *
 * toNewsCardData mantiene retrocompatibilità: alcuni file vecchi possono
 * ancora chiamarla; restituisce semplicemente lo stesso oggetto.
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
