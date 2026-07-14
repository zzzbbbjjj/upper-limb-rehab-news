import { getPaginatedPapers, getAllTags } from '@/lib/papers'
import PaperList from '@/components/PaperList'
import Pagination from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import TagBadge from '@/components/TagBadge'
import Link from 'next/link'

export default function HomePage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = Number(searchParams.page) || 1
  const { items: papers, totalPages, page: currentPage } = getPaginatedPapers(page, 10)
  const tags = getAllTags()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero section */}
      <section className="mb-10 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              🦾 上肢康复机器人 · 研究前沿
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 text-lg">
              每周自动聚合最新研究论文 · 中英双语 · 持续追踪
            </p>
          </div>
        </div>
        <SearchBar large />
      </section>

      {/* Hot tags */}
      {tags.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              热门标签
            </span>
            {tags.slice(0, 12).map(t => (
              <TagBadge key={t.name} tag={t.name} count={t.count} />
            ))}
            <Link
              href="/tags"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline ml-2"
            >
              查看全部 →
            </Link>
          </div>
        </section>
      )}

      {/* Paper count */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          📰 最新论文
        </h2>
        <span className="text-sm text-slate-400">
          共 {papers.length} 篇，第 {currentPage} / {totalPages} 页
        </span>
      </div>

      {/* Paper grid */}
      <PaperList papers={papers} featuredFirst />

      {/* Pagination */}
      <Pagination page={currentPage} totalPages={totalPages} />
    </div>
  )
}
