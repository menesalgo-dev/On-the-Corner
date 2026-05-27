/**
 * lib/rss/parser.ts
 * Fetch + parse di tutti i feed RSS.
 * Ritorna NewsItem standardizzati pronti per il dedup globale.
 */
import { XMLParser } from 'fast-xml-parser';
import {
  FEEDS,
  type FeedSource,
  MAX_ITEMS_PER_SOURCE,
  MAX_AGE_DAYS_IT,
  MAX_AGE_DAYS_EN,
  FETCH_TIMEOUT_MS,
  RSS_USER_AGENT,
} from './config';
import { categorize } from './categorize';
import { type NewsItem, stripHtml, normalizeTitle, normalizeUrl, sha1 } from '@/lib/news/types';

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

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
  parseTagValue: false,
  parseAttributeValue: false,
  cdataPropName: '__cdata',
});

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': RSS_USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return await parseFeedXml(xml, feed);
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
  } catch {
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

/** Recupera notizie da tutti gli RSS configurati. */
export async function fetchAllRssNews(): Promise<{
  items: NewsItem[];
  perSource: Record<string, number>;
  failed: string[];
}> {
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

  return { items: all, perSource, failed };
}
