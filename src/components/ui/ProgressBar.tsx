export default function ProgressBar({
  percent,
  className = '',
}: {
  percent: number
  tone?: 'lime' | 'ink'
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className={`progress-track ${className}`}>
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  )
}
