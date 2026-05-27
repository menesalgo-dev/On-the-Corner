/**
 * app/api/cron/sync-news/route.ts
 * Endpoint chiamato da Vercel Cron ogni 15 minuti.
 * Protetto da CRON_SECRET (header Authorization).
 *
 * Vercel Cron invia automaticamente:
 *   Authorization: Bearer <CRON_SECRET>
 */
import { NextResponse, type NextRequest } from 'next/server';
import { runSync } from '@/server/sync/run-sync';

export const maxDuration = 60; // Vercel free: max 60s
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verifica autorizzazione cron Vercel
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync();
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    console.error('[cron/sync-news] fatal:', err);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
