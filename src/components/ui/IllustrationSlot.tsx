/** Flat-vector illustration slot. No final art has been produced yet (see design handoff §Assets) —
 *  renders an empty dashed frame at the correct aspect ratio so layout ships correctly today and a
 *  real <img> can drop in later without any markup change. */
export default function IllustrationSlot({
  ratio,
  className = '',
  minHeight,
}: {
  ratio?: string
  className?: string
  minHeight?: number
}) {
  return (
    <div
      className={`ill-frame flex items-center justify-center border border-dashed border-line-strong ${className}`}
      style={{ aspectRatio: ratio, minHeight }}
    >
      <span className="meta text-text-muted">illustration</span>
    </div>
  )
}
