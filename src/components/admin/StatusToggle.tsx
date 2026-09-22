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
      className={
        isPublished
          ? 'badge badge-pass shrink-0'
          : 'shrink-0 rounded-pill border border-border-secondary px-3 py-1 font-body text-[11px] font-bold uppercase tracking-[0.06em] text-muted hover:border-muted hover:text-display'
      }
    >
      {isPublished ? 'published' : 'draft'}
    </button>
  )
}
