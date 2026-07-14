'use client'

import Link from 'next/link'
import type { Paper } from '@/lib/types'
import { useLanguage } from '@/lib/i18n'
import TagBadge from './TagBadge'

interface PaperCardProps {
  paper: Paper
  featured?: boolean
}

export default function PaperCard({ paper, featured = false }: PaperCardProps) {
  const { lang, t } = useLanguage()

  const title = lang === 'zh' ? paper.title : paper.title_en
  const tags = lang === 'zh' ? paper.tags : paper.tags_en

  // Extract first paragraph for preview
  const previewParagraph = paper.content.split('\n\n').find(p => p.trim() && !p.startsWith('#')) || ''
  const cleanPreview = previewParagraph.replace(/^## .*\n/, '').trim().slice(0, 200)

  return (
    <article className={`card group ${featured ? 'ring-2 ring-primary-200 dark:ring-primary-800' : ''}`}>
      <Link href={`/papers/${paper.slug}`} className="block p-5 sm:p-6">
        {/* Source & Date */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="source-badge">{paper.source}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(paper.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {t('paper.minRead', { minutes: paper.readingTime })}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2 ${
            featured ? 'text-xl sm:text-2xl' : 'text-lg'
          }`}
        >
          {title}
        </h2>

        {/* Authors */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          {paper.authors.slice(0, 5).join(', ')}
          {paper.authors.length > 5 && ` et al. (${paper.authors.length - 5} more)`}
        </p>

        {/* Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
          {cleanPreview}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.slice(0, 5).map(tag => (
            <span key={tag} className="tag-badge" onClick={e => e.stopPropagation()}>
              {tag}
            </span>
          ))}
          {tags.length > 5 && (
            <span className="text-xs text-slate-400">+{tags.length - 5}</span>
          )}
        </div>

        {/* Read more link */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:underline">
            {t('paper.readMore')} →
          </span>
          {paper.doi && (
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              DOI: {paper.doi.slice(0, 25)}{paper.doi.length > 25 ? '...' : ''}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
