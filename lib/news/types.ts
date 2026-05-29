/**
 * lib/news/types.ts
 * Tipi e adapter per le news.
 */

/** Riga DB news_items (snake_case Postgres). */
export interface NewsItemRow {
  id: string
  hash: string
  source_id: string | null
  source_name: string | null
  title: string
  link: string
  description: string | null
  image_url: string | null
  lang: string
  priority: number | null
  published_at: string
  tags: string[] | null
  category_id: string
  created_at: string
}

/**
 * Forma camelCase usata da NewsCard e altri componenti vecchi.
 * Mantenuta per retrocompatibilità con codice esistente.
 */
export interface NewsCardData {
  id: string
  hash: string
  sourceId: string | null
  sourceName: string | null
  title: string
  link: string
  description: string | null
  imageUrl: string | null
  lang: string
  priority: number | null
  publishedAt: string
  tags: string[] | null
  categoryId: string
}

/** Converte una riga snake_case del DB in camelCase per le card. */
export function toNewsCardData(row: NewsItemRow): NewsCardData {
  return {
    id: row.id,
    hash: row.hash,
    sourceId: row.source_id,
    sourceName: row.source_name,
    title: row.title,
    link: row.link,
    description: row.description,
    imageUrl: row.image_url,
    lang: row.lang,
    priority: row.priority,
    publishedAt: row.published_at,
    tags: row.tags,
    categoryId: row.category_id,
  }
}
