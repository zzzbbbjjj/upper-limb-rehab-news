import fs from 'fs'
import path from 'path'
import { cache } from 'react'
import type { Paper, PaperFrontmatter } from './types'

const PAPERS_DIR = path.join(process.cwd(), 'content', 'papers')

function parseFrontmatter(raw: string): { frontmatter: PaperFrontmatter; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid MDX frontmatter')

  const frontmatterStr = match[1]
  const body = match[2]

  const frontmatter: Record<string, unknown> = {}
  let currentKey = ''
  let isArray = false
  let arrayValues: string[] = []

  for (const line of frontmatterStr.split('\n')) {
    const keyValMatch = line.match(/^(\w+):\s*(.*)/)
    const arrayItemMatch = line.match(/^\s+-\s+"(.*)"/) || line.match(/^\s+-\s+(.*)/)

    if (arrayItemMatch) {
      arrayValues.push(arrayItemMatch[1].replace(/^"|"$/g, ''))
      continue
    }

    if (arrayValues.length > 0 && currentKey) {
      frontmatter[currentKey] = arrayValues
      arrayValues = []
    }

    if (keyValMatch) {
      currentKey = keyValMatch[1]
      const val = keyValMatch[2].trim()
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          frontmatter[currentKey] = JSON.parse(val)
        } catch {
          frontmatter[currentKey] = val
        }
      } else if (val.startsWith('"') && val.endsWith('"')) {
        frontmatter[currentKey] = val.slice(1, -1)
      } else {
        frontmatter[currentKey] = val
      }
    }
  }

  if (arrayValues.length > 0 && currentKey) {
    frontmatter[currentKey] = arrayValues
  }

  return { frontmatter: frontmatter as unknown as PaperFrontmatter, body }
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export const getAllPapers = cache((): Paper[] => {
  if (!fs.existsSync(PAPERS_DIR)) return []

  const files = fs.readdirSync(PAPERS_DIR).filter(f => f.endsWith('.mdx'))

  const papers = files
    .map(file => {
      const raw = fs.readFileSync(path.join(PAPERS_DIR, file), 'utf-8')
      const { frontmatter, body } = parseFrontmatter(raw)
      const slug = file.replace(/\.mdx$/, '')
      return {
        ...frontmatter,
        slug,
        content: body.trim(),
        readingTime: estimateReadingTime(body),
      } as Paper
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return papers
})

export const getPaperBySlug = cache((slug: string): Paper | null => {
  try {
    const filePath = path.join(PAPERS_DIR, `${slug}.mdx`)
    if (!fs.existsSync(filePath)) return null
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(raw)
    return {
      ...frontmatter,
      slug,
      content: body.trim(),
      readingTime: estimateReadingTime(body),
    } as Paper
  } catch {
    return null
  }
})

export const getPapersByTag = cache((tag: string): Paper[] => {
  const all = getAllPapers()
  return all.filter(
    p => p.tags.includes(tag) || p.tags_en.includes(tag)
  )
})

export function searchPapersLocal(query: string): Paper[] {
  const all = getAllPapers()
  const q = query.toLowerCase()
  return all.filter(p => {
    const searchText = [
      p.title, p.title_en, p.source,
      ...p.authors, ...p.tags, ...p.tags_en,
      ...p.keywords, ...p.keywords_en,
      p.content,
    ].join(' ').toLowerCase()
    return searchText.includes(q)
  })
}

export const getAllTags = cache((): { name: string; name_en: string; count: number }[] => {
  const all = getAllPapers()
  const tagMap = new Map<string, { name_en: string; count: number }>()

  all.forEach(p => {
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
})

export function getPaginatedPapers(page: number, pageSize: number = 10) {
  const all = getAllPapers()
  const total = all.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * pageSize
  const items = all.slice(start, start + pageSize)
  return { items, total, totalPages, page: safePage, pageSize }
}

export function getWeeklyPapers(): { weekLabel: string; papers: Paper[] }[] {
  const all = getAllPapers()
  const weeks = new Map<string, Paper[]>()

  all.forEach(p => {
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

export const getAllSlugs = cache((): string[] => {
  if (!fs.existsSync(PAPERS_DIR)) return []
  return fs.readdirSync(PAPERS_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''))
})
