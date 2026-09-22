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
    <div className="flex flex-col items-center gap-0.5">
      {/* text-current: this renders inside both `.card` (on-light text) and
          dark table rows (text-body), so it inherits whichever is correct
          rather than hardcoding one. Each button is sized to exactly its
          icon (rather than the browser's default padding) so the two
          stack in a straight column instead of drifting apart. */}
      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label="Move up"
        className="flex h-4 w-4 items-center justify-center text-current opacity-70 hover:text-accent hover:opacity-100 disabled:opacity-25"
      >
        <ChevronUpIcon className="h-4 w-4" />
      </button>
      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label="Move down"
        className="flex h-4 w-4 items-center justify-center text-current opacity-70 hover:text-accent hover:opacity-100 disabled:opacity-25"
      >
        <ChevronDownIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
