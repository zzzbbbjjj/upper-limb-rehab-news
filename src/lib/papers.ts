import papersData from '@/data/papers.json'
import type { Paper } from './types'

// All papers pre-loaded from build-time JSON (no fs dependency)
const ALL_PAPERS: Paper[] = papersData as Paper[]

// Ensure sorted by date descending
ALL_PAPERS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

export function getAllPapers(): Paper[] {
  return ALL_PAPERS
}

export function getPaperBySlug(slug: string): Paper | null {
  return ALL_PAPERS.find(p => p.slug === slug) || null
}

export function getPapersByTag(tag: string): Paper[] {
  return ALL_PAPERS.filter(
    p => p.tags.includes(tag) || p.tags_en.includes(tag)
  )
}

export function searchPapersLocal(query: string): Paper[] {
  const q = query.toLowerCase()
  return ALL_PAPERS.filter(p => {
    const searchText = [
      p.title, p.title_en, p.source,
      ...p.authors, ...p.tags, ...p.tags_en,
      ...p.keywords, ...p.keywords_en,
      p.content,
    ].join(' ').toLowerCase()
    return searchText.includes(q)
  })
}

export function getAllTags(): { name: string; name_en: string; count: number }[] {
  const tagMap = new Map<string, { name_en: string; count: number }>()

  ALL_PAPERS.forEach(p => {
    p.tags.forEach((tag, i) => {
      const existing = tagMap.get(tag)
      if (existing) {
        existing.count++
      } else {
        tagMap.set(tag, { name_en: p.tags_en[i] || tag, count: 1 })
      }
    })
  })

  return Array.from(tagMap.entries())
    .map(([name, { name_en, count }]) => ({ name, name_en, count }))
    .sort((a, b) => b.count - a.count)
}

export function getPaginatedPapers(page: number, pageSize: number = 10) {
  const total = ALL_PAPERS.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * pageSize
  const items = ALL_PAPERS.slice(start, start + pageSize)
  return { items, total, totalPages, page: safePage, pageSize }
}

export function getWeeklyPapers(): { weekLabel: string; papers: Paper[] }[] {
  const weeks = new Map<string, Paper[]>()

  ALL_PAPERS.forEach(p => {
    const d = new Date(p.date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - d.getDay() + 1)
    const key = monday.toISOString().slice(0, 10)
    if (!weeks.has(key)) weeks.set(key, [])
    weeks.get(key)!.push(p)
  })

  return Array.from(weeks.entries())
    .map(([key, papers]) => ({ weekLabel: key, papers }))
    .sort((a, b) => b.weekLabel.localeCompare(a.weekLabel))
}

export function getAllSlugs(): string[] {
  return ALL_PAPERS.map(p => p.slug)
}
