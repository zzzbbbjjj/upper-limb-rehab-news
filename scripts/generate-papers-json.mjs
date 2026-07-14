/**
 * Pre-build script: reads all MDX files and generates a JSON data file
 * that can be imported by client-side code (no `fs` dependency needed).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAPERS_DIR = path.resolve(__dirname, '..', 'content', 'papers')
const OUTPUT_FILE = path.resolve(__dirname, '..', 'src', 'data', 'papers.json')

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('Invalid MDX frontmatter')

  const frontmatterStr = match[1]
  const body = match[2]

  const frontmatter = {}
  let currentKey = ''
  let arrayValues = []

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
        try { frontmatter[currentKey] = JSON.parse(val) } catch { frontmatter[currentKey] = val }
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

  return { frontmatter, body }
}

function estimateReadingTime(text) {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function main() {
  if (!fs.existsSync(PAPERS_DIR)) {
    console.log('No papers directory found. Creating empty data file.')
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
    fs.writeFileSync(OUTPUT_FILE, '[]')
    return
  }

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
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true })
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(papers, null, 2), 'utf-8')
  console.log(`✅ Generated papers.json with ${papers.length} papers`)
}

main()
