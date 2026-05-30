/**
 * lib/profile/data.ts
 *
 * Recupera dati profilo aggregati dal DB:
 *  - Conteggio bookmark
 *  - Giorni da membro
 *  - Sport preferiti (calcolati su bookmark)
 *  - Bookmark recenti (3 ultimi)
 */
import { supabaseServer } from '@/lib/news';

export interface ProfileData {
  memberDays: number;
  bookmarkCount: number;
  favoriteSports: Array<{
    id: string;
    label: string;
    emoji: string;
    count: number;
  }>;
  recentBookmarks: Array<{
    id: string;
    hash: string;
    title: string;
    source_name: string | null;
    published_at: string;
  }>;
}

const SPORT_META: Record<string, { label: string; emoji: string }> = {
  calcio: { label: 'Calcio', emoji: '⚽' },
  champions: { label: 'Champions', emoji: '🏆' },
  f1: { label: 'F1', emoji: '🏎️' },
  motogp: { label: 'MotoGP', emoji: '🏍️' },
  tennis: { label: 'Tennis', emoji: '🎾' },
  nfl: { label: 'NFL', emoji: '🏈' },
  basket: { label: 'Basket', emoji: '🏀' },
  altro: { label: 'Altro', emoji: '📰' },
};

export async function fetchProfileData(userId: string, createdAtIso: string): Promise<ProfileData> {
  // Calcola giorni da membro (richiede `created_at` dell'utente, passato dall'auth)
  const memberDays = createdAtIso
    ? Math.max(1, Math.floor((Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Bookmark count totale (per user_id)
  let bookmarkCount = 0;
  try {
    const { count } = await supabaseServer
      .from('news_bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    bookmarkCount = count ?? 0;
  } catch (err) {
    console.error('[profile] bookmarkCount:', err);
  }

  // Bookmark con join su news_items per ottenere category_id e info articolo
  let bookmarkRows: Array<{
    news_hash: string;
    created_at: string;
    news_items: any;
  }> = [];
  try {
    const { data } = await supabaseServer
      .from('news_bookmarks')
      .select(`
        news_hash,
        created_at,
        news_items!inner(id, hash, title, source_name, published_at, category_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    bookmarkRows = (data ?? []) as any;
  } catch (err) {
    console.error('[profile] bookmarkRows:', err);
  }

  // Calcola sport preferiti dai bookmark (top 5 categorie)
  const categoryCounts = new Map<string, number>();
  bookmarkRows.forEach((bk: any) => {
    const cat = String(bk.news_items?.category_id || 'altro').toLowerCase().trim();
    if (cat && cat !== 'fantacalcio') {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
  });

  const favoriteSports = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      id,
      label: SPORT_META[id]?.label ?? id,
      emoji: SPORT_META[id]?.emoji ?? '🏆',
      count,
    }));

  // Bookmark recenti (3 ultimi)
  const recentBookmarks = bookmarkRows.slice(0, 3).map((bk: any) => ({
    id: bk.news_items?.id ?? bk.news_items?.hash ?? '',
    hash: bk.news_items?.hash ?? '',
    title: bk.news_items?.title ?? '(senza titolo)',
    source_name: bk.news_items?.source_name ?? null,
    published_at: bk.news_items?.published_at ?? '',
  }));

  return {
    memberDays,
    bookmarkCount,
    favoriteSports,
    recentBookmarks,
  };
}
