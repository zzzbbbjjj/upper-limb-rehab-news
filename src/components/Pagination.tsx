'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'

interface PaginationProps {
  page: number
  totalPages: number
  basePath?: string
  queryParams?: Record<string, string>
}

export default function Pagination({ page, totalPages, basePath = '', queryParams = {} }: PaginationProps) {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  const buildHref = (p: number) => {
    const params = new URLSearchParams(queryParams)
    if (p > 1) params.set('page', String(p))
    else params.delete('page')
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath || '/'
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600
            text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          ← {t('pagination.prev')}
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed">
          ← {t('pagination.prev')}
        </span>
      )}

      <span className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
        {t('pagination.page', { page, total: totalPages })}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600
            text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {t('pagination.next')} →
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed">
          {t('pagination.next')} →
        </span>
      )}
    </div>
  )
}
