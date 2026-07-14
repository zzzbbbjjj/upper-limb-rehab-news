import { getAllTags } from '@/lib/papers'
import TagBadge from '@/components/TagBadge'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '所有标签',
}

export default function TagsIndexPage() {
  const tags = getAllTags()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">🏷️ 所有标签</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">按标签浏览论文，标签越大表示相关论文越多</p>

      <div className="card p-6">
        <div className="flex flex-wrap gap-3">
          {tags.map(t => (
            <span key={t.name} className="relative" style={{ fontSize: `${Math.max(0.75, Math.min(1.5, 0.75 + t.count * 0.08))}rem` }}>
              <TagBadge tag={t.name} count={t.count} />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
