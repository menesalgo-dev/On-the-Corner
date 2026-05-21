/**
 * lib/rss/parser.ts
 * Parser RSS server-side. Funziona sia su Node (Next.js) sia su Deno (Edge Functions)
 * usando solo API standard + `fast-xml-parser` (puro JS, zero binding nativi).
 *
 * Pipeline:
 *   fetch parallelo  →  parse XML  →  normalize  →  filtro età  →  cap per fonte
 *   →  dedup globale (titolo+url)  →  ordinamento (priorità, recency)
 */

import { XMLParser } from 'fast-xml-parser';
import {
  FEEDS,
  type FeedSource,
  MAX_ITEMS_PER_SOURCE,
  MAX_AGE_DAYS,
  FETCH_TIMEOUT_MS,
  RSS_USER_AGENT,
  DEDUP_TITLE_SIM_THRESHOLD,
} from './config';

// ─────────────────────────────  TIPI  ─────────────────────────────

export interface NewsItem {
  /** Hash univoco usato come PK (sha1 di link+titolo normalizzati). */
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
}

// ─────────────────────────────  UTILS  ─────────────────────────────

const STRIP_TAGS = /<[^>]+>/g;
const MULTI_SPACE = /\s+/g;

/** Pulisce HTML, decode entità basilari, normalizza spazi. */
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

/** Normalizza titolo per il confronto: lowercase, no punteggiatura, no accenti. */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(MULTI_SPACE, ' ')
    .trim();
}

/** Rimuove query tracking, fragment, trailing slash. */
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

/** Hash sha-1 cross-runtime (Web Crypto disponibile sia su Node 20+ che su Deno). */
async function sha1(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Estrae la prima immagine valida da un item RSS.
 * Cerca in: media:content, media:thumbnail, enclosure, primo <img> dentro description.
 */
function pickImage(item: AnyRecord): string | null {
  // media:content
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
  // enclosure
  const enc = item.enclosure;
  if (enc) {
    const url = (Array.isArray(enc) ? enc[0]?.['@_url'] : enc['@_url']) as string | undefined;
    if (url) return url;
  }
  // <img> nella description
  const html = (item.description ?? item['content:encoded'] ?? '') as string;
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  return m ? m[1] : null;
}

/** Distanza di Levenshtein normalizzata 0–1 (1 = identici). */
function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return 1 - dp[m][n] / Math.max(m, n);
}

type AnyRecord = Record<string, unknown> & { [k: string]: any };

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
      // niente cache: l'aggregator gira a intervalli fissi
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

  // Supporto RSS 2.0 (rss.channel.item) e Atom (feed.entry).
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
  const minAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

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

    // filtro per età massima
    if (now - publishedAtMs > minAgeMs) continue;

    const description = stripHtml((it.description?.__cdata ?? it.description ?? it.summary ?? '') as string).slice(0, 600);
    const imageUrl = pickImage(it);
    const hash = await sha1(`${link}::${normalizeTitle(title)}`);

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
    });

    if (out.length >= MAX_ITEMS_PER_SOURCE) break;
  }
  return out;
}

// ───────────────────────  DEDUP & ORDER  ───────────────────────

function deduplicate(items: NewsItem[]): NewsItem[] {
  // Ordina per priorità asc (1 prima), poi recency desc → conservare la "versione migliore".
  const sorted = [...items].sort((a, b) =>
    a.priority - b.priority ||
    Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  const kept: NewsItem[] = [];
  const seenHashes = new Set<string>();
  const seenLinks = new Set<string>();
  const titleIndex: { norm: string; ref: NewsItem }[] = [];

  for (const item of sorted) {
    if (seenHashes.has(item.hash)) continue;
    if (seenLinks.has(item.link)) continue;

    const norm = normalizeTitle(item.title);

    // confronto fuzzy con quanto già tenuto
    let duplicate = false;
    for (const existing of titleIndex) {
      // shortcut: se uno è prefisso dell'altro, considera duplicato
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
    titleIndex.push({ norm, ref: item });
  }
  return kept;
}

// ────────────────────────  ENTRYPOINT  ─────────────────────────

export interface AggregateResult {
  items: NewsItem[];
  stats: {
    totalFetched: number;
    afterDedup: number;
    perSource: Record<string, number>;
    failed: string[];
  };
}

/**
 * Aggrega tutte le fonti e restituisce notizie pulite, deduplicate e ordinate.
 * Da usare nella Edge Function `sync-news`.
 */
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

  // ordinamento finale: priorità (1 prima) → recency
  deduped.sort(
    (a, b) =>
      a.priority - b.priority ||
      Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  return {
    items: deduped,
    stats: {
      totalFetched: all.length,
      afterDedup: deduped.length,
      perSource,
      failed,
    },
  };
}

// Esporta utility utili anche altrove
export { normalizeTitle, normalizeUrl, similarity };
