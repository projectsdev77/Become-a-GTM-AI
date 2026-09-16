import type { CSSProperties } from 'react'

/** The eleven client-supplied illustrations, keyed by their design-handoff slot id. */
const SLOTS = {
  'v4-g1': '/illustrations/v4-g1.jpg',
  'v4-g2': '/illustrations/v4-g2.jpg',
  'v4-g3': '/illustrations/v4-g3.jpg',
  'v4-t1': '/illustrations/v4-t1.jpg',
  'v4-t2': '/illustrations/v4-t2.jpg',
  'v4-t3': '/illustrations/v4-t3.jpg',
  'v4-queue-empty': '/illustrations/v4-queue-empty.jpg',
  'v4-auth': '/illustrations/v4-auth.jpg',
  'v4-auth-2': '/illustrations/v4-auth-2.jpg',
  'v4-404': '/illustrations/v4-404.jpg',
  'v4-cert': '/illustrations/v4-cert.jpg',
} as const

export type IllustrationSlotId = keyof typeof SLOTS

/** Decorative only — every slot sits beside text that already carries the meaning, so alt is always "". */
export default function Illustration({
  slot,
  className = '',
  style,
  loading = 'lazy',
}: {
  slot: IllustrationSlotId
  className?: string
  style?: CSSProperties
  loading?: 'eager' | 'lazy'
}) {
  return <img src={SLOTS[slot]} alt="" loading={loading} className={`ill-frame ${className}`} style={style} />
}
