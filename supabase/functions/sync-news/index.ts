/**
 * supabase/functions/sync-news/index.ts
 * Edge Function Deno che aggrega tutti gli RSS configurati e popola la
 * tabella `news_items`. Eseguita ogni 15 minuti via pg_cron.
 *
 * Nota: il parser è duplicato nel modulo `lib/rss` lato Next.js perché
 * Deno e Node hanno path diversi. Mantieni le due copie allineate, oppure
 * sposta `lib/rss` in un pacchetto npm condiviso (`packages/rss`).
 *
 * Deploy:
 *   supabase functions deploy sync-news --no-verify-jwt
 * Invocazione manuale (debug):
 *   curl -X POST https://<PROJECT>.supabase.co/functions/v1/sync-news \
 *        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
 */

// @ts-ignore — Deno std
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

import { aggregateAllFeeds, type NewsItem } from './_parser.ts';
import { MAX_AGE_DAYS } from './_config.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  throw new Error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
}

const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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
  };
}

// ───────────────────  CHUNK helper (batch insert)  ───────────────────
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ──────────────────────────────  Handler  ────────────────────────────
Deno.serve(async (_req) => {
  const t0 = Date.now();

  try {
    const { items, stats } = await aggregateAllFeeds();
    const rows = items.map(toRow);

    // Upsert in batch da 200 — evita request body troppo grandi.
    let inserted = 0;
    for (const batch of chunk(rows, 200)) {
      const { error, count } = await supa
        .from('news_items')
        .upsert(batch, { onConflict: 'hash', count: 'exact', ignoreDuplicates: false });
      if (error) throw error;
      inserted += count ?? batch.length;
    }

    // Pulizia: elimina news più vecchie di MAX_AGE_DAYS.
    const threshold = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString();
    const { error: delErr, count: deleted } = await supa
      .from('news_items')
      .delete({ count: 'exact' })
      .lt('published_at', threshold);
    if (delErr) console.warn('cleanup failed:', delErr.message);

    const elapsed = Date.now() - t0;
    return new Response(
      JSON.stringify({
        ok: true,
        elapsed_ms: elapsed,
        upserted: inserted,
        deleted: deleted ?? 0,
        stats,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[sync-news] fatal:', err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});

/*
 * Promemoria struttura cartella:
 *   supabase/functions/sync-news/
 *     ├─ index.ts        ← questo file
 *     ├─ _parser.ts      ← copia del parser (porting Deno-friendly)
 *     └─ _config.ts      ← copia del config (idem)
 *
 * Il porting Deno richiede:
 *   - Sostituire `import { XMLParser } from 'fast-xml-parser'`
 *     con `import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.4.1'`
 *   - Mantenere il resto invariato (Web Crypto è disponibile nativamente).
 */
