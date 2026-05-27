/**
 * lib/external-news/guardian.ts
 * Integrazione The Guardian Open Platform (free 5000 req/giorno).
 * Registrati su https://open-platform.theguardian.com/
 */
import { categorize } from '@/lib/rss/categorize';
import { type NewsItem, normalizeTitle, normalizeUrl, sha1 } from '@/lib/news/types';

interface GuardianResult {
  id: string;
  type: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
    headline?: string;
  };
}

interface GuardianResponse {
  response: {
    status: string;
    results: GuardianResult[];
  };
}

/**
 * Recupera notizie sportive dal Guardian.
 * Filtriamo per sezione 'sport' + ultimi giorni.
 */
export async function fetchGuardian(): Promise<NewsItem[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey) {
    console.warn('[guardian] GUARDIAN_API_KEY mancante, skip');
    return [];
  }

  const fromDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
  const url = `https://content.guardianapis.com/sport?from-date=${fromDate}&page-size=40&order-by=newest&show-fields=trailText,thumbnail,headline&api-key=${apiKey}`;

  try {
    const res = await fetch(url, { cache: 'no-store', headers: { 'User-Agent': 'OnTheCornerBot/1.0' } });
    if (!res.ok) {
      console.warn(`[guardian] HTTP ${res.status}`);
      return [];
    }

    const json = (await res.json()) as GuardianResponse;
    if (json.response.status !== 'ok' || !Array.isArray(json.response.results)) return [];

    const items: NewsItem[] = [];
    const now = Date.now();
    const maxAge = 3 * 86400000;

    for (const r of json.response.results) {
      if (!r.webTitle || !r.webUrl) continue;
      const ts = Date.parse(r.webPublicationDate);
      if (Number.isNaN(ts)) continue;
      if (now - ts > maxAge) continue;

      const link = normalizeUrl(r.webUrl);
      const title = r.fields?.headline ?? r.webTitle;
      const description = (r.fields?.trailText ?? '').slice(0, 600);
      const hash = await sha1(`${link}::${normalizeTitle(title)}`);
      const categoryId = categorize({ forceCat: undefined }, title, description);

      items.push({
        hash,
        sourceId: 'guardian',
        sourceName: 'The Guardian',
        title,
        link,
        description,
        imageUrl: r.fields?.thumbnail ?? null,
        lang: 'en',
        priority: 2,
        publishedAt: new Date(ts).toISOString(),
        tags: ['guardian'],
        categoryId,
      });
    }

    return items;
  } catch (err) {
    console.warn('[guardian] fetch failed:', (err as Error).message);
    return [];
  }
}
