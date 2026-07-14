'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/i18n'

interface SearchBarProps {
  initialQuery?: string
  large?: boolean
}

export default function SearchBar({ initialQuery = '', large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()
  const { t } = useLanguage()

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (trimmed) {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      }
    },
    [query, router]
  )

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${large ? 'flex-col sm:flex-row' : ''}`}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className={`flex-1 rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800 text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition-shadow ${large ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'}`}
        />
        <button
          type="submit"
          className={`font-medium rounded-lg bg-primary-600 text-white
            hover:bg-primary-700 transition-colors
            ${large ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm'}`}
        >
          {t('search.button')}
        </button>
      </div>
    </form>
  )
}
