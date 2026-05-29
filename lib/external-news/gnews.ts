/**
 * lib/external-news/gnews.ts
 * Integrazione GNews.io (free 100 req/giorno).
 * Registrati su https://gnews.io/register
 */
import { categorize } from '@/lib/rss/categorize';
// Importiamo NewsItemRow al posto di NewsItem che non esiste più
import { type NewsItem, normalizeTitle, normalizeUrl, sha1 } from '@/lib/news/types';

interface GnewsArticle {
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url: string };
}

interface GnewsResponse {
  totalArticles: number;
  articles: GnewsArticle[];
}

// Cambiamo il tipo di ritorno della Promise in NewsItemRow[]
export async function fetchGnews(): Promise<NewsItem[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.warn('[gnews] GNEWS_API_KEY mancante, skip');
    return [];
  }

  const urls = [
    `https://gnews.io/api/v4/top-headlines?category=sports&lang=it&country=it&max=20&apikey=${apiKey}`,
    `https://gnews.io/api/v4/top-headlines?category=sports&lang=en&max=15&apikey=${apiKey}`,
  ];

  const results = await Promise.allSettled(
    urls.map((u) => fetch(u, { cache: 'no-store', headers: { 'User-Agent': 'OnTheCornerBot/1.0' } })),
  );

  // Array tipizzato correttamente in NewsItemRow[]
  const items: NewsItem[] = [];
  const now = Date.now();

  for (let i = 0; i < results.length; i++) {
    const r = results[i]!;
    if (r.status !== 'fulfilled' || !r.value.ok) {
      console.warn(`[gnews] feed ${i} failed`);
      continue;
    }
    const json = (await r.value.json()) as GnewsResponse;
    if (!Array.isArray(json.articles)) continue;

    const lang: 'it' | 'en' = i === 0 ? 'it' : 'en';
    const maxAge = lang === 'it' ? 7 * 86400000 : 3 * 86400000;

    for (const a of json.articles) {
      if (!a.title || !a.url) continue;
      const ts = Date.parse(a.publishedAt);
      if (Number.isNaN(ts)) continue;
      if (now - ts > maxAge) continue;

      const link = normalizeUrl(a.url);
      const hash = await sha1(`${link}::${normalizeTitle(a.title)}`);
      const description = (a.description ?? '').slice(0, 600);
      const categoryId = categorize({ forceCat: undefined }, a.title, description);

      // Mappatura convertita da camelCase a snake_case per combaciare con l'interfaccia NewsItemRow del DB
      items.push({
        hash,
        sourceId: `gnews_${a.source.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        sourceName: a.source.name,
        title: a.title,
        link,
        description,
        imageUrl: a.image,
        lang,
        priority: lang === 'it' ? 1 : 2,
        publishedAt: new Date(ts).toISOString(),
        tags: ['gnews'],
        categoryId: categoryId,
      });
    }
  }

  return items;
}
