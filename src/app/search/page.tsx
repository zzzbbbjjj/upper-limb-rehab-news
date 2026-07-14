import { searchPapersLocal } from '@/lib/papers'
import SearchBar from '@/components/SearchBar'
import PaperList from '@/components/PaperList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '搜索论文',
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ''
  const page = Number(searchParams.page) || 1
  const pageSize = 10

  let papers = searchPapersLocal(query)
  const total = papers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  papers = papers.slice(start, start + pageSize)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">🔍 搜索论文</h1>
      <SearchBar initialQuery={query} large />

      {query && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              搜索结果: &ldquo;{query}&rdquo;
            </h2>
            <span className="text-sm text-slate-400">共 {total} 篇论文</span>
          </div>

          {total > 0 ? (
            <>
              <PaperList papers={papers} featuredFirst={false} />
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {page > 1 && (
                    <a
                      href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                      className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      ← 上一页
                    </a>
                  )}
                  <span className="px-4 py-2 text-sm text-slate-500">
                    第 {page} / {totalPages} 页
                  </span>
                  {page < totalPages && (
                    <a
                      href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                      className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      下一页 →
                    </a>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <span className="text-4xl">🔬</span>
              <p className="mt-4 text-slate-500 dark:text-slate-400">
                未找到相关论文，请尝试其他关键词如 &ldquo;外骨骼&rdquo;、&ldquo;绳索驱动&rdquo;、&ldquo;脑卒中&rdquo; 等。
              </p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <span className="text-5xl block mb-4">🔍</span>
          <p>输入关键词搜索论文标题、摘要、作者和标签</p>
          <p className="mt-2 text-sm">支持中英文搜索</p>
        </div>
      )}
    </div>
  )
}
