import { getWeeklyPapers } from '@/lib/papers'
import PaperCard from '@/components/PaperCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '论文归档',
}

export default function ArchivePage() {
  const weeks = getWeeklyPapers()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">📚 论文归档</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">按周分组浏览历史论文</p>

      {weeks.length === 0 && (
        <div className="text-center py-16">
          <span className="text-4xl">📭</span>
          <p className="mt-4 text-slate-500">暂无归档论文。</p>
        </div>
      )}

      <div className="space-y-12">
        {weeks.map(week => (
          <section key={week.weekLabel}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 sticky top-16 bg-slate-50 dark:bg-slate-950 py-2 z-10">
              📅 {new Date(week.weekLabel).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} 周
              <span className="ml-2 text-sm font-normal text-slate-400">({week.papers.length} 篇)</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {week.papers.map((paper, idx) => (
                <PaperCard key={paper.slug} paper={paper} featured={idx === 0} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
