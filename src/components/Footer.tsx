'use client'

import { useLanguage } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🦾</span> {t('site.title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {t('footer.description')}
            </p>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1 text-right">
            <p>{t('footer.builtWith')}</p>
            <p>{t('footer.automated')}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
