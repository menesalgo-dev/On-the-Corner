/**
 * lib/news/types.ts
 * Tipi condivisi tra RSS parser e integratori API esterne.
 * Aggiornato con helper di mappatura nativi per PostgreSQL (Supabase).
 */
import type { CategoryId } from '@/lib/rss/config';

export interface NewsItem {
  hash: string;
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  description: string;
  imageUrl: string | null;
  lang: 'it' | 'en';
  priority: 1 | 2;
  publishedAt: string;
  tags: string[];
  categoryId: CategoryId;
}

const STRIP_TAGS = /<[^>]+>/g;
const MULTI_SPACE = /\s+/g;

export function stripHtml(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(STRIP_TAGS, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/'/g, "'")
    .replace(MULTI_SPACE, ' ')
    .trim();
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(MULTI_SPACE, ' ')
    .trim();
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const drop = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid','ref','refsrc','source','share'];
    drop.forEach((k) => u.searchParams.delete(k));
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch {
    return raw.trim();
  }
}

export async function sha1(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Distanza Levenshtein normalizzata (1 = identici, 0 = totalmente diversi).
 * Type-safe per strict mode.
 */
export function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) (dp[i] as number[])[0] = i;
  for (let j = 0; j <= n; j++) (dp[0] as number[])[j] = j;
  for (let i = 1; i <= m; i++) {
    const row = dp[i] as number[];
    const prev = dp[i - 1] as number[];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        (prev[j] as number) + 1,
        (row[j - 1] as number) + 1,
        (prev[j - 1] as number) + cost,
      );
    }
  }
  return 1 - ((dp[m] as number[])[n] as number) / Math.max(m, n);
}

/**
 * Mappa un oggetto NewsItem (CamelCase) nel record SnakeCase richiesto dal database.
 * Risolve definitivamente l'errore malformed array literal forzando un array di stringhe nativo.
 */
export function toDatabaseRow(item: NewsItem) {
  return {
    hash: item.hash,
    source_id: item.sourceId,
    source_name: item.sourceName,
    title: item.title,
    link: item.link,
    description: item.description,
    image_url: item.imageUrl,
    lang: item.lang,
    priority: item.priority,
    published_at: item.publishedAt,
    tags: Array.isArray(item.tags) ? item.tags : [], // Fix nativo array per PostgreSQL
    category_id: item.categoryId
  };
}

/**
 * Converte una riga estratta dal database (SnakeCase) nell'interfaccia NewsItem (CamelCase)
 * utilizzata dai componenti del frontend.
 */
export function toFrontendItem(row: any): NewsItem {
  return {
    hash: row.hash,
    sourceId: row.source_id,
    sourceName: row.source_name,
    title: row.title,
    link: row.link,
    description: row.description,
    imageUrl: row.image_url,
    lang: row.lang,
    priority: row.priority,
    publishedAt: row.published_at,
    tags: row.tags || [],
    categoryId: row.category_id
  };
}
