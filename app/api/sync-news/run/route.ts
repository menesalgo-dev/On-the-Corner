/**
 * app/api/sync-news/run/route.ts
 * Endpoint MANUALE per forzare un sync da browser/curl.
 * Protetto da query param ?secret=XXX.
 *
 * Uso:
 *   https://on-the-corner.vercel.app/api/sync-news/run?secret=TUO_CRON_SECRET
 *
 * Ritorna JSON con statistiche dettagliate.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { runSync } from '@/server/sync/run-sync';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'unauthorized', hint: 'Aggiungi ?secret=<CRON_SECRET> alla URL' },
      { status: 401 },
    );
  }

  try {
    const result = await runSync();
    return NextResponse.json(result, {
      status: result.ok ? 200 : 500,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
