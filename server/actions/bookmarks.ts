/**
 * server/actions/bookmarks.ts
 * Toggle bookmark notizia. Richiede autenticazione.
 *
 * Cast a `never` sui payload per superare il "client untyped" di Supabase.
 * Questo è il workaround ufficiale documentato in @supabase/ssr 0.5.x
 * quando la struttura dei tipi DB non viene riconosciuta dal generic.
 */
'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { errorMessage } from '@/lib/utils';

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function toggleBookmark(
  newsId: string,
): Promise<ActionResult<{ bookmarked: boolean }>> {
  if (!newsId || typeof newsId !== 'string') {
    return { ok: false, error: 'invalid_id' };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'not_authenticated' };

    const { data: existing } = await supabase
      .from('news_bookmarks')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('news_id', newsId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('news_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('news_id', newsId);
      if (error) return { ok: false, error: error.message };
      revalidateTag(`bookmarks:${user.id}`);
      return { ok: true, data: { bookmarked: false } };
    }

    // ⚠️ Cast a `never` necessario: il client Supabase in alcune versioni
    // di @supabase/ssr non propaga il generic <Database> sulle insert,
    // facendo cadere il tipo della firma su `never[]`. Il payload è
    // comunque validato a runtime dal database.
    const { error } = await supabase
      .from('news_bookmarks')
      .insert({ user_id: user.id, news_id: newsId } as never);

    if (error) return { ok: false, error: error.message };
    revalidateTag(`bookmarks:${user.id}`);
    return { ok: true, data: { bookmarked: true } };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
