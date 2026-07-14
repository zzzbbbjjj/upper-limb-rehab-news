'use client'

import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import LanguageToggle from './LanguageToggle'
import { useState } from 'react'

export default function Header() {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🦾</span>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t('site.title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('site.subtitle')}
              </p>
            </div>
            <h1 className="sm:hidden text-sm font-bold text-slate-900 dark:text-white">
              ULR News
            </h1>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/archive"
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('nav.archive')}
            </Link>
            <Link
              href="/tags"
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('nav.tags')}
            </Link>
            <Link
              href="/search"
              className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('nav.search')}
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 border-t border-slate-200 dark:border-slate-700 pt-2">
            <Link href="/" className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('nav.home')}</Link>
            <Link href="/archive" className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('nav.archive')}</Link>
            <Link href="/tags" className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('nav.tags')}</Link>
            <Link href="/search" className="block px-3 py-2 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>{t('nav.search')}</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
