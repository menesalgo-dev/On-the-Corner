/**
 * lib/news/types.ts
 * Tipi snake_case allineati al DB Postgres e al codice esistente.
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
  category_id: string; // Arriva già valorizzato dal DB (es. 'calcio', 'f1', 'tennis')
  category_name?: string | null;
  category_emoji?: string | null;
  created_at: string;
}

/** Dati passati ai componenti card della UI. */
export interface NewsCardData {
  id: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  source_name: string;
  published_at: string;
  category_id: string;
  category_name: string;
  category_emoji: string;
}

/** * Map ufficiale del Front-End. 
 * Associa a ogni category_id del DB il rispettivo Nome e l'Emoji per la UI.
 */
const CATEGORY_UI_MAP: Record<string, { name: string; emoji: string }> = {
  calcio: { name: 'Calcio', emoji: '⚽' },
  champions: { name: 'Champions League', emoji: '🏆' },
  f1: { name: 'Formula 1', emoji: '🏎️' },
  motogp: { name: 'MotoGP', emoji: '🏍️' },
  tennis: { name: 'Tennis', emoji: '🎾' },
  nfl: { name: 'NFL', emoji: '🏈' },
  altro: { name: 'Sport', emoji: '📰' },
};

/**
 * Adapter — Prende i dati così come sono categorizzati nel DB.
 * Se la riga del DB non contiene già category_name o category_emoji (es. tabelle non in JOIN),
 * li associa istantaneamente basandosi sul category_id fornito dal DB.
 */
export function toNewsCardData(row: NewsItemRow): NewsCardData {
  // Riconosce la categoria del DB o fa fallback su 'altro'
  const finalCategoryId = row.category_id && CATEGORY_UI_MAP[row.category_id] 
    ? row.category_id 
    : 'altro';

  const uiDetails = CATEGORY_UI_MAP[finalCategoryId];

  return {
    id: row.id || row.hash,
    title: row.title,
    link: row.link,
    description: row.description,
    image_url: row.image_url,
    source_name: row.source_name ?? 'Sport News',
    published_at: row.published_at,
    category_id: finalCategoryId,
    category_name: row.category_name ?? uiDetails.name,   // Usa il DB, altrimenti la mappa UI
    category_emoji: row.category_emoji ?? uiDetails.emoji, // Usa il DB, altrimenti la mappa UI
  };
}

// ============================================================
// UTILITIES CONDIVISE (Necessarie per far compilare gnews.ts)
// ============================================================
export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const drop = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid','ref','source','share'];
    drop.forEach(k => u.searchParams.delete(k));
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch { 
    return raw.trim(); 
  }
}

export function normalizeTitle(t: string): string {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}

export async function sha1(testo: string): Promise<string> {
  const buf = new TextEncoder().encode(testo);
  const hash = await crypto.subtle.digest('SHA-1', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
