'use client'

import { useLanguage } from '@/lib/i18n'

export default function LanguageToggle() {
  const { lang, t, toggleLang } = useLanguage()

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg
        bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
        hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label={t('language.switch')}
    >
      <span>{lang === 'zh' ? '🇨🇳' : '🇺🇸'}</span>
      <span className="hidden sm:inline">{t('language.switch')}</span>
    </button>
  )
}
