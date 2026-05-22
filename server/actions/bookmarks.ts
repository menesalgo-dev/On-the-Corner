/**
 * server/actions/bookmarks.ts
 * Toggle bookmark notizia. Richiede autenticazione.
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

    const { error } = await supabase.from('news_bookmarks').insert({
      user_id: user.id,
      news_id: newsId,
    });
    if (error) return { ok: false, error: error.message };
    revalidateTag(`bookmarks:${user.id}`);
    return { ok: true, data: { bookmarked: true } };
  } catch (err) {
    return { ok: false, error: errorMessage(err) };
  }
}
