import type { Paper } from '@/lib/types'
import PaperCard from './PaperCard'

interface PaperListProps {
  papers: Paper[]
  featuredFirst?: boolean
}

export default function PaperList({ papers, featuredFirst = true }: PaperListProps) {
  if (papers.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl">📭</span>
        <p className="mt-4 text-slate-500 dark:text-slate-400">暂无匹配论文。</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {papers.map((paper, idx) => (
        <PaperCard
          key={paper.slug}
          paper={paper}
          featured={featuredFirst && idx === 0}
        />
      ))}
    </div>
  )
}
