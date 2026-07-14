export interface PaperFrontmatter {
  title: string
  title_en: string
  authors: string[]
  date: string
  source: string
  source_url: string
  doi?: string
  tags: string[]
  tags_en: string[]
  keywords: string[]
  keywords_en: string[]
}

export interface Paper extends PaperFrontmatter {
  slug: string
  content: string
  readingTime: number
}

export type Language = 'zh' | 'en'

export interface PageParams {
  params: { slug: string }
}

export interface TagPageParams {
  params: { tag: string }
}

export interface SearchPageParams {
  searchParams: { q?: string; page?: string }
}
