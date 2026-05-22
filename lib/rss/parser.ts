/**
 * lib/rss/parser.ts — versione W3 con fix strict mode.
 *
 * Aggiunte rispetto a W1:
 *  - Categorizzazione automatica (categorize)
 *  - Bilanciamento lingua (cap EN se IT ≥ soglia)
 *  - Max age differenziato per lingua (IT 7gg, EN 3gg) come sito vecchio
 *  - Type-safe con noUncheckedIndexedAccess
 */

import { XMLParser } from 'fast-xml-parser';
import {
  FEEDS,
  type FeedSource,
  type CategoryId,
  MAX_ITEMS_PER_SOURCE,
  MAX_AGE_DAYS_IT,
  MAX_AGE_DAYS_EN,
  FETCH_TIMEOUT_MS,
  RSS_USER_AGENT,
  DEDUP_TITLE_SIM_THRESHOLD,
  BALANCE_LANG_THRESHOLD_IT,
  BALANCE_LANG_EN_CAP_PCT,
} from './config';
import { categorize, balanceByLanguage } from './categorize';

// ─────────────────────────────  TIPI  ─────────────────────────────

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
  publishedAt: string;   // ISO
  tags: string[];
  categoryId: CategoryId;
}

// ─────────────────────────────  UTILS  ─────────────────────────────

const STRIP_TAGS = /<[^>]+>/g;
const MULTI_SPACE = /\s+/g;

function stripHtml(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(STRIP_TAGS, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(MULTI_SPACE, ' ')
    .trim();
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(MULTI_SPACE, ' ')
    .trim();
}

function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    const drop = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid','ref','refsrc'];
    drop.forEach((k) => u.searchParams.delete(k));
    u.hash = '';
    let s = u.toString();
    if (s.endsWith('/')) s = s.slice(0, -1);
    return s;
  } catch {
    return raw.trim();
  }
}

async function sha1(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type AnyRecord = Record<string, unknown> & { [k: string]: any };

function pickImage(item: AnyRecord): string | null {
  const mc = item['media:content'] ?? item['mediaContent'];
  if (mc) {
    const url = (Array.isArray(mc) ? mc[0]?.['@_url'] : mc['@_url']) as string | undefined;
    if (url) return url;
  }
  const mt = item['media:thumbnail'] ?? item['mediaThumbnail'];
  if (mt) {
    const url = (Array.isArray(mt) ? mt[0]?.['@_url'] : mt['@_url']) as string | undefined;
    if (url) return url;
  }
  const enc = item.enclosure;
  if (enc) {
    const url = (Array.isArray(enc) ? enc[0]?.['@_url'] : enc['@_url']) as string | undefined;
    if (url) return url;
  }
  const html = (item.description ?? item['content:encoded'] ?? '') as string;
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m && m[1] ? m[1] : null;
}

function similarity(a: string, b: string): number {
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

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
  cdataPropName: '__cdata',
});

// ─────────────────────────────  FETCH  ─────────────────────────────

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: { 'User-Agent': RSS_USER_AGENT, 'Accept': 'application/rss+xml, application/xml, text/xml, */*' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${feed.id}`);
    const xml = await res.text();
    return parseFeedXml(xml, feed);
  } catch (err) {
    console.warn(`[rss] ${feed.id} failed:`, (err as Error).message);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function parseFeedXml(xml: string, feed: FeedSource): Promise<NewsItem[]> {
  let parsed: AnyRecord;
  try {
    parsed = xmlParser.parse(xml) as AnyRecord;
  } catch (err) {
    console.warn(`[rss] parse failed on ${feed.id}:`, (err as Error).message);
    return [];
  }

  const rssItems = parsed?.rss?.channel?.item;
  const atomItems = parsed?.feed?.entry;
  const rawItems: AnyRecord[] = Array.isArray(rssItems)
    ? rssItems
    : rssItems
      ? [rssItems]
      : Array.isArray(atomItems)
        ? atomItems
        : atomItems
          ? [atomItems]
          : [];

  if (rawItems.length === 0) return [];

  const now = Date.now();
  const maxAgeDays = feed.lang === 'it' ? MAX_AGE_DAYS_IT : MAX_AGE_DAYS_EN;
  const minAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  const out: NewsItem[] = [];
  for (const it of rawItems) {
    const title = stripHtml((it.title?.__cdata ?? it.title) as string);
    const linkRaw = (typeof it.link === 'string'
      ? it.link
      : it.link?.['@_href'] ?? it.link?.href ?? it.guid?.__cdata ?? it.guid ?? '') as string;
    if (!title || !linkRaw) continue;

    const link = normalizeUrl(linkRaw);
    const pubRaw = (it.pubDate ?? it.published ?? it.updated ?? it['dc:date']) as string | undefined;
    const publishedAtMs = pubRaw ? Date.parse(pubRaw) : NaN;
    if (Number.isNaN(publishedAtMs)) continue;
    if (now - publishedAtMs > minAgeMs) continue;

    const description = stripHtml((it.description?.__cdata ?? it.description ?? it.summary ?? '') as string).slice(0, 600);
    const imageUrl = pickImage(it);
    const hash = await sha1(`${link}::${normalizeTitle(title)}`);

    const categoryId = categorize(feed, title, description);

    out.push({
      hash,
      sourceId: feed.id,
      sourceName: feed.name,
      title,
      link,
      description,
      imageUrl,
      lang: feed.lang,
      priority: feed.priority,
      publishedAt: new Date(publishedAtMs).toISOString(),
      tags: [],
      categoryId,
    });

    if (out.length >= MAX_ITEMS_PER_SOURCE) break;
  }
  return out;
}

// ───────────────────────  DEDUP & ORDER  ───────────────────────

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
    let duplicate = false;
    for (const existing of titleIndex) {
      if (existing.norm === norm) { duplicate = true; break; }
      if (Math.abs(existing.norm.length - norm.length) > 20) continue;
      if (similarity(existing.norm, norm) >= DEDUP_TITLE_SIM_THRESHOLD) {
        duplicate = true; break;
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

// ────────────────────────  ENTRYPOINT  ─────────────────────────

export interface AggregateResult {
  items: NewsItem[];
  stats: {
    totalFetched: number;
    afterDedup: number;
    afterBalance: number;
    perSource: Record<string, number>;
    perCategory: Record<string, number>;
    failed: string[];
  };
}

export async function aggregateAllFeeds(): Promise<AggregateResult> {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const all: NewsItem[] = [];
  const perSource: Record<string, number> = {};
  const failed: string[] = [];

  results.forEach((r, i) => {
    const feed = FEEDS[i]!;
    if (r.status === 'fulfilled') {
      perSource[feed.id] = r.value.length;
      all.push(...r.value);
    } else {
      failed.push(feed.id);
      perSource[feed.id] = 0;
    }
  });

  const deduped = deduplicate(all);

  const balanced = balanceByLanguage(
    deduped,
    BALANCE_LANG_THRESHOLD_IT,
    BALANCE_LANG_EN_CAP_PCT,
  );

  balanced.sort(
    (a, b) =>
      a.priority - b.priority ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  const perCategory: Record<string, number> = {};
  balanced.forEach((i) => {
    perCategory[i.categoryId] = (perCategory[i.categoryId] ?? 0) + 1;
  });

  return {
    items: balanced,
    stats: {
      totalFetched: all.length,
      afterDedup: deduped.length,
      afterBalance: balanced.length,
      perSource,
      perCategory,
      failed,
    },
  };
}

export { normalizeTitle, normalizeUrl, similarity };
