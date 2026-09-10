export default function ProgressBar({
  percent,
  tone = 'signal',
  className = '',
}: {
  percent: number
  tone?: 'signal' | 'ink'
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      className={`progress-track w-full ${className}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-fill"
        style={{ width: `${clamped}%`, background: tone === 'signal' ? 'var(--color-signal)' : 'var(--color-ink)' }}
      />
    </div>
  )
}
