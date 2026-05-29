/**
 * lib/news/types.ts
 * Tipi condivisi e normalizzazione record PostgreSQL (Supabase) in NewsCardData.
 * Aggiornato: Filtro Anti-Miniature e Forzatura Sinossi HD Estese.
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

export interface NewsCardData {
  id: string; // Hash SHA-1 logico della notizia
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

export function toNewsCardData(row: any): NewsCardData {
  const categoryMeta: Record<string, { name: string; emoji: string }> = {
    '1': { name: 'Calcio', emoji: '⚽' },
    '2': { name: 'F1', emoji: '🏎️' },
    '3': { name: 'Tennis', emoji: '🎾' },
    '4': { name: 'MotoGP', emoji: '🏍️' }
  };

  const meta = categoryMeta[String(row.category_id || '')];

  // 1. FILTRO ANTI-MINIATURE E SANIFICAZIONE IMMAGINI
  let cleanImageUrl = row.image_url || row.imageUrl || null;
  if (cleanImageUrl && typeof cleanImageUrl === 'string') {
    cleanImageUrl = cleanImageUrl.trim();
    if (cleanImageUrl.startsWith('http://')) {
      cleanImageUrl = cleanImageUrl.replace('http://', 'https://');
    }
    cleanImageUrl = cleanImageUrl
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s/g, '%20');

    // Scarta icone minuscole, loghi quadrati, avatar e stringhe Base64/SVG non valide per i feed HD
    if (
      cleanImageUrl.includes('avatar') ||
      cleanImageUrl.includes('logo') ||
      cleanImageUrl.includes('icon') ||
      cleanImageUrl.includes('placeholder') ||
      cleanImageUrl.includes('1x1') ||
      cleanImageUrl.includes('150x150') ||
      cleanImageUrl.includes('data:image/') || 
      cleanImageUrl.endsWith('.svg')
    ) {
      cleanImageUrl = null; // Sblocca il fallback nativo per evitare foto sgranate o rotte
    }
  } else {
    cleanImageUrl = null;
  }

  // 2. RECUPERO E OTTIMIZZAZIONE SINOSSI EDITORIALE ESTESA
  // Unifica tutti i potenziali campi di riepilogo del database per recuperare il testo più denso
  let cleanDescription = row.description || row.summary || row.content || '';
  cleanDescription = cleanDescription.trim();

  // Rimuove i tre puntini nativi di troncamento dei feed RSS prima di servire il dato
  if (cleanDescription.endsWith('...')) {
    cleanDescription = cleanDescription.slice(0, -3).trim();
  }

  return {
    id: row.hash,
    title: row.title || '',
    link: row.link || row.url || '',
    description: cleanDescription.length > 5 ? cleanDescription : null,
    image_url: cleanImageUrl,
    source_name: row.source_name || row.source || 'Premium Source',
    published_at: row.published_at,
    category_id: row.category_id ? String(row.category_id) : null,
    category_name: meta ? meta.name : null,
    category_emoji: meta ? meta.emoji : null,
  };
}
