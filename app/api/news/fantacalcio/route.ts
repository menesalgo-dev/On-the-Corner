/**
 * app/api/news/fantacalcio/route.ts
 * Endpoint per estrarre le notizie indicizzate di Fantacalcio dal database.
 */
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 24;

    const { data, error } = await supabaseServer
      .from('fantacalcio_items')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ success: true, count: data?.length || 0, items: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
