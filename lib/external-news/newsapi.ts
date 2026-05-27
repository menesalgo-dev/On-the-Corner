/**
 * lib/external-news/newsapi.ts
 * Integrazione NewsAPI.org (free 100 req/giorno).
 * Registrati su https://newsapi.org/register
 */
import { categorize } from '@/lib/rss/categorize';
import { type NewsItem, normalizeTitle, normalizeUrl, sha1 } from '@/lib/news/types';

interface NewsApiArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

/**
 * Recupera notizie sportive da NewsAPI.
 * Usa endpoint /v2/top-headlines?category=sports per IT + EN.
 */
export async function fetchNewsApi(): Promise<NewsItem[]> {
  const apiKey = process.env.NEWSAPI_KEY;
  if (!apiKey) {
    console.warn('[newsapi] NEWSAPI_KEY mancante, skip');
    return [];
  }

  const urls = [
    `https://newsapi.org/v2/top-headlines?category=sports&country=it&pageSize=30&apiKey=${apiKey}`,
    `https://newsapi.org/v2/top-headlines?category=sports&country=us&pageSize=20&apiKey=${apiKey}`,
  ];

  const results = await Promise.allSettled(
    urls.map((u) => fetch(u, { cache: 'no-store', headers: { 'User-Agent': 'OnTheCornerBot/1.0' } })),
  );

  const items: NewsItem[] = [];
  const now = Date.now();

  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    if (r.status !== 'fulfilled' || !r.value.ok) {
      console.warn(`[newsapi] feed ${i} failed`);
      continue;
    }
    const json = (await r.value.json()) as NewsApiResponse;
    if (json.status !== 'ok' || !Array.isArray(json.articles)) continue;

    const lang: 'it' | 'en' = i === 0 ? 'it' : 'en';
    const maxAge = lang === 'it' ? 7 * 86400000 : 3 * 86400000;

    for (const a of json.articles) {
      if (!a.title || !a.url || a.title === '[Removed]') continue;
      const ts = Date.parse(a.publishedAt);
      if (Number.isNaN(ts)) continue;
      if (now - ts > maxAge) continue;

      const link = normalizeUrl(a.url);
      const hash = await sha1(`${link}::${normalizeTitle(a.title)}`);
      const description = (a.description ?? '').slice(0, 600);
      const categoryId = categorize({ forceCat: undefined }, a.title, description);

      items.push({
        hash,
        sourceId: `newsapi_${a.source.id ?? a.source.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        sourceName: a.source.name,
        title: a.title,
        link,
        description,
        imageUrl: a.urlToImage,
        lang,
        priority: lang === 'it' ? 1 : 2,
        publishedAt: new Date(ts).toISOString(),
        tags: ['newsapi'],
        categoryId,
      });
    }
  }

  return items;
}
