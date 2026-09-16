import type { PublishStatus } from '@/types/database'

export default function StatusToggle({
  status,
  onChange,
}: {
  status: PublishStatus
  onChange: (next: PublishStatus) => void
}) {
  const isPublished = status === 'published'
  return (
    <button
      onClick={() => onChange(isPublished ? 'draft' : 'published')}
      className={`badge shrink-0 ${isPublished ? 'badge-pass' : 'badge-neutral'}`}
    >
      {isPublished ? 'published' : 'draft'}
    </button>
  )
}
