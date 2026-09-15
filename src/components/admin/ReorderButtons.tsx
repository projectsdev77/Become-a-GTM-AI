import { ChevronUpIcon, ChevronDownIcon } from '@/components/ui/icons'

export default function ReorderButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  return (
    <div className="flex flex-col">
      {/* text-current: this renders inside both `.card` (on-light text) and
          dark table rows (text-body), so it inherits whichever is correct
          rather than hardcoding one. */}
      <button onClick={onMoveUp} disabled={!canMoveUp} aria-label="Move up" className="text-current opacity-70 hover:text-primary hover:opacity-100 disabled:opacity-25">
        <ChevronUpIcon className="h-4 w-4" />
      </button>
      <button onClick={onMoveDown} disabled={!canMoveDown} aria-label="Move down" className="text-current opacity-70 hover:text-primary hover:opacity-100 disabled:opacity-25">
        <ChevronDownIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
