import Link from 'next/link'

interface TagBadgeProps {
  tag: string
  lang?: 'zh' | 'en'
  count?: number
}

export default function TagBadge({ tag, count }: TagBadgeProps) {
  return (
    <Link href={`/tags/${encodeURIComponent(tag)}`} className="tag-badge no-underline">
      {tag}
      {count !== undefined && (
        <span className="ml-1 text-xs opacity-60">({count})</span>
      )}
    </Link>
  )
}
