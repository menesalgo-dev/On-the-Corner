/**
 * lib/news/types.ts
 * Tipi per le news.
 */
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
