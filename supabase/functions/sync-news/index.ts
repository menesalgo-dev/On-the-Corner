/**
 * sync-news - Versione Unica per Dashboard Supabase
 * Tutto in un solo file - Senza import esterni
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { XMLParser } from 'npm:fast-xml-parser@4.4.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MAX_AGE_DAYS = 7;

const FEEDS = [
  { name: "Repubblica", url: "https://www.repubblica.it/rss/homepage/rss2.0.xml" },
  { name: "Corriere della Sera", url: "https://www.corriere.it/rss/homepage/rss2.0.xml" },
  { name: "ANSA", url: "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml" },
  { name: "Il Sole 24 Ore", url: "https://www.ilsole24ore.com/rss/homepage/rss2.0.xml" },
  { name: "La Stampa", url: "https://www.lastampa.it/rss.xml" },
  { name: "Il Post", url: "https://www.ilpost.it/feed/" },
];

async function fetchAndParseFeed(feed: { name: string; url: string }) {
  try {
    const response = await fetch(feed.url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (tagName) => tagName === 'item' || tagName === 'entry',
    });

    const parsed = parser.parse(xmlText);
    const channel = parsed.rss?.channel || parsed.feed;
    const items = channel?.item  channel?.entry  [];

    return items.map((item: any) => {
      const title = item.title?.['#text']  item.title  "Senza titolo";
      const link = item.link?.['@_href']  item.link?.['#text']  item.link;
      const description = item.description?.['#text']  item.description  item.summary;
      const pubDate = item.pubDate  item.published  item.updated;

      return {
        hash: btoa(encodeURI(title + (typeof link === 'string' ? link : ''))).slice(0, 32),
        source_id: feed.name.toLowerCase().replace(/\s+/g, '-'),
        source_name: feed.name,
        title: String(title).slice(0, 500),
        link: typeof link === 'string' ? link.trim() : "",
        description: description ? String(description).slice(0, 1000) : null,
        image_url: null,
        lang: 'it',
        priority: 50,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        tags: [],
      };
    }).filter(item => item.link);

  } catch (error) {
    console.error(`Errore nel feed ${feed.name}:`, error);
    return [];
  }
}

Deno.serve(async () => {
  const startTime = Date.now();

  try {
    let allItems: any[] = [];

    for (const feed of FEEDS) {
      const items = await fetchAndParseFeed(feed);
      allItems = [...allItems, ...items];
    }

    // Upsert su Supabase
    const { error, count } = await supa
      .from('news_items')
      .upsert(allItems, { 
        onConflict: 'hash',
        ignoreDuplicates: true 
      });

    if (error) throw error;

    // Pulizia news vecchie
    const threshold = new Date(Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await supa.from('news_items').delete().lt('published_at', threshold);

    return new Response(
      JSON.stringify({
        success: true,
        total_fetched: allItems.length,
        upserted: count,
        execution_time_ms: Date.now() - startTime
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Errore sync-news:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
