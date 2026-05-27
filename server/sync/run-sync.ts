/**
 * server/sync/run-sync.ts
 * Pipeline completa di sync:
 *  1. Fetch RSS (21 fonti) in parallelo a NewsAPI/Guardian/GNews
 *  2. Dedup forte (hash + link + title + similarity)
 *  3. Bilanciamento lingua
 *  4. Upsert su Supabase con onConflict
 *  5. Cleanup notizie vecchie
 */
import { createClient } from '@supabase/supabase-js';
import { fetchAllRssNews } from '@/lib/rss/parser';
import { fetchNewsApi } from '@/lib/external-news/newsapi';
import { fetchGuardian } from '@/lib/external-news/guardian';
import { fetchGnews } from '@/lib/external-news/gnews';
import { balanceByLanguage } from '@/lib/rss/categorize';
import {
  BALANCE_LANG_THRESHOLD_IT,
  BALANCE_LANG_EN_CAP_PCT,
  DEDUP_TITLE_SIM_THRESHOLD,
  MAX_AGE_DAYS_IT,
} from '@/lib/rss/config';
import { similarity, normalizeTitle, type NewsItem } from '@/lib/news/types';

export interface SyncResult {
  ok: boolean;
  elapsed_ms: number;
  fetched: {
    rss: number;
    newsapi: number;
    guardian: number;
    gnews: number;
    total: number;
  };
  after_dedup: number;
  after_balance: number;
  upserted: number;
  deleted: number;
  perSource: Record<string, number>;
  perCategory: Record<string, number>;
  failed: string[];
  error?: string;
}

/**
 * Dedup forte: 4 livelli sequenziali.
 * Mantiene la prima occorrenza (priority 1 = IT viene PRIMA di priority 2 = EN).
 */
function deduplicate(items: NewsItem[]): NewsItem[] {
  const sorted = [...items].sort((a, b) =>
    a.priority - b.priority ||
    Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  const kept: NewsItem[] = [];
  const seenHashes = new Set<string>();
  const seenLinks = new Set<string>();
  const titleIndex: { norm: string }[] = [];

  for (const item of sorted) {
    if (seenHashes.has(item.hash)) continue;
    if (seenLinks.has(item.link)) continue;

    const norm = normalizeTitle(item.title);
    let duplicate = titleIndex.some((e) => e.norm === norm);

    if (!duplicate) {
      for (const existing of titleIndex) {
        if (Math.abs(existing.norm.length - norm.length) > 25) continue;
        if (similarity(existing.norm, norm) >= DEDUP_TITLE_SIM_THRESHOLD) {
          duplicate = true;
          break;
        }
      }
    }

    if (duplicate) continue;

    kept.push(item);
    seenHashes.add(item.hash);
    seenLinks.add(item.link);
    titleIndex.push({ norm });
  }

  return kept;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

interface NewsRow {
  hash: string;
  source_id: string;
  source_name: string;
  title: string;
  link: string;
  description: string | null;
  image_url: string | null;
  lang: 'it' | 'en';
  priority: number;
  published_at: string;
  tags: string[];
  category_id: string;
}

function toRow(n: NewsItem): NewsRow {
  return {
    hash: n.hash,
    source_id: n.sourceId,
    source_name: n.sourceName,
    title: n.title.slice(0, 500),
    link: n.link,
    description: n.description ? n.description.slice(0, 1000) : null,
    image_url: n.imageUrl,
    lang: n.lang,
    priority: n.priority,
    published_at: n.publishedAt,
    tags: n.tags,
    category_id: n.categoryId,
  };
}

/**
 * Esegue il sync completo. Ritorna risultato strutturato.
 */
export async function runSync(): Promise<SyncResult> {
  const t0 = Date.now();

  const rawSupaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawSupaUrl || !serviceRole) {
    return {
      ok: false,
      elapsed_ms: 0,
      fetched: { rss: 0, newsapi: 0, guardian: 0, gnews: 0, total: 0 },
      after_dedup: 0,
      after_balance: 0,
      upserted: 0,
      deleted: 0,
      perSource: {},
      perCategory: {},
      failed: [],
      error: 'Missing SUPABASE env vars',
    };
  }

  // 🚨 ESTRAZIONE CHIRURGICA DEL DOMINIO BASE
  // Rimuove "/rest/v1" o slash finali se inseriti per errore su Vercel
  let supaUrl = rawSupaUrl.trim();
  try {
    const urlObj = new URL(supaUrl);
    supaUrl = urlObj.origin; 
  } catch {
    if (supaUrl.endsWith('/')) supaUrl = supaUrl.slice(0, -1);
  }

  const supabase = createClient(supaUrl, serviceRole);

  // 1. Fetch parallelo da TUTTE le fonti
  const [rssResult, newsapi, guardian, gnews] = await Promise.all([
    fetchAllRssNews(),
    fetchNewsApi().catch((e) => {
      console.warn('[sync] newsapi crashed:', (e as Error).message);
      return [];
    }),
    fetchGuardian().catch((e) => {
      console.warn('[sync] guardian crashed:', (e as Error).message);
      return [];
    }),
    fetchGnews().catch((e) => {
      console.warn('[sync] gnews crashed:', (e as Error).message);
      return [];
    }),
  ]);

  const fetched = {
    rss: rssResult.items.length,
    newsapi: newsapi.length,
    guardian: guardian.length,
    gnews: gnews.length,
    total: 0,
  };
  fetched.total = fetched.rss + fetched.newsapi + fetched.guardian + fetched.gnews;

  // 2. Merge + dedup
  const allItems = [...rssResult.items, ...newsapi, ...guardian, ...gnews];
  const deduped = deduplicate(allItems);

  // 3. Bilanciamento lingua
  const balanced = balanceByLanguage(deduped, BALANCE_LANG_THRESHOLD_IT, BALANCE_LANG_EN_CAP_PCT);

  // 4. Sort finale: priority → recency
  balanced.sort(
    (a, b) =>
      a.priority - b.priority ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  // 5. Conta per categoria (statistica)
  const perCategory: Record<string, number> = {};
  const perSource = { ...rssResult.perSource };
  balanced.forEach((i) => {
    perCategory[i.categoryId] = (perCategory[i.categoryId] ?? 0) + 1;
    if (!perSource[i.sourceId]) perSource[i.sourceId] = 0;
    perSource[i.sourceId]! += 1;
  });

  // 6. Upsert su Supabase a batch
  const rows = balanced.map(toRow);
  let upserted = 0;
  for (const batch of chunk(rows, 200)) {
    const { error, count } = await supabase
      .from('news_items')
      .upsert(batch as never, { onConflict: 'hash', count: 'exact', ignoreDuplicates: false });
    if (error) {
      return {
        ok: false,
        elapsed_ms: Date.now() - t0,
        fetched,
        after_dedup: deduped.length,
        after_balance: balanced.length,
        upserted,
        deleted: 0,
        perSource,
        perCategory,
        failed: rssResult.failed,
        error: `upsert: ${error.message}`,
      };
    }
    upserted += count ?? batch.length;
  }

  // 7. Cleanup notizie troppo vecchie
  const threshold = new Date(Date.now() - MAX_AGE_DAYS_IT * 86_400_000).toISOString();
  let deleted = 0;
  try {
    const { count } = await supabase
      .from('news_items')
      .delete({ count: 'exact' })
      .lt('published_at', threshold);
    deleted = count ?? 0;
  } catch (err) {
    console.warn('[sync] cleanup failed:', (err as Error).message);
  }

  return {
    ok: true,
    elapsed_ms: Date.now() - t0,
    fetched,
    after_dedup: deduped.length,
    after_balance: balanced.length,
    upserted,
    deleted,
    perSource,
    perCategory,
    failed: rssResult.failed,
  };
}
