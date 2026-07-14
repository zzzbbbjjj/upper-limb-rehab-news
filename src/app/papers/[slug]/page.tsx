import { getPaperBySlug, getAllSlugs } from '@/lib/papers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TagBadge from '@/components/TagBadge'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const paper = getPaperBySlug(params.slug)
  if (!paper) return { title: 'Not Found' }
  return {
    title: paper.title,
    description: paper.content.slice(0, 160),
  }
}

export default function PaperDetailPage({ params }: Props) {
  const paper = getPaperBySlug(params.slug)
  if (!paper) notFound()

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
      >
        ← 返回列表
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Source & Date */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="source-badge">{paper.source}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">
            {new Date(paper.date).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Chinese Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          {paper.title}
        </h1>

        {/* English Title */}
        <h2 className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium mb-4">
          {paper.title_en}
        </h2>

        {/* Authors */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
          <span className="text-slate-400 dark:text-slate-500">✍️</span>
          {paper.authors.join(', ')}
        </div>

        {/* Meta links */}
        <div className="flex items-center gap-4 flex-wrap mb-4">
          {paper.source_url && (
            <a
              href={paper.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              📄 原文链接
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-500 dark:text-slate-400 font-mono hover:text-primary-600 dark:hover:text-primary-400"
            >
              DOI: {paper.doi}
            </a>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 dark:text-slate-500">🏷️</span>
          {paper.tags.map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="card p-6 sm:p-8 paper-content">
        <div className="prose dark:prose-invert max-w-none">
          {paper.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return (
                <h2 key={i} className="text-xl font-bold text-primary-800 dark:text-primary-300 mt-8 mb-3">
                  {line.replace('## ', '')}
                </h2>
              )
            }
            if (line.trim() === '') return <div key={i} className="h-3" />
            return (
              <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                {line}
              </p>
            )
          })}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          ← 返回论文列表
        </Link>
      </div>
    </article>
  )
}
