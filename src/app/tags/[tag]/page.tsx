import { getPapersByTag, getAllTags } from '@/lib/papers'
import { notFound } from 'next/navigation'
import PaperList from '@/components/PaperList'
import type { Metadata } from 'next'

interface Props {
  params: { tag: string }
}

export function generateStaticParams() {
  const tags = getAllTags()
  return [...tags.map(t => ({ tag: t.name })), ...tags.map(t => ({ tag: t.name_en }))]
}

export function generateMetadata({ params }: Props): Metadata {
  const decoded = decodeURIComponent(params.tag)
  return { title: `标签: ${decoded}` }
}

export default function TagPage({ params }: Props) {
  const tag = decodeURIComponent(params.tag)
  const papers = getPapersByTag(tag)

  if (!papers.length) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
        🏷️ 标签 &ldquo;{tag}&rdquo;
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">共找到 {papers.length} 篇论文</p>

      <PaperList papers={papers} />
    </div>
  )
}
