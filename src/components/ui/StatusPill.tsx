import type { ReactNode } from 'react'
import { CheckIcon, AlertIcon, LockIcon } from './icons'

export type StatusVariant = 'pass' | 'progress' | 'warn' | 'fail' | 'locked' | 'draft'

const config: Record<StatusVariant, { cls: string; icon?: ReactNode }> = {
  pass: { cls: 'badge-pass', icon: <CheckIcon className="h-3 w-3" /> },
  progress: { cls: 'badge-pending' },
  warn: { cls: 'badge-pending', icon: <AlertIcon className="h-3 w-3" /> },
  fail: { cls: 'badge-alert', icon: <AlertIcon className="h-3 w-3" /> },
  locked: { cls: 'badge-neutral', icon: <LockIcon className="h-3 w-3" /> },
  draft: { cls: 'badge-neutral' },
}

/** On a cream row, pass `tone="cream"` so a neutral badge picks the on-cream ink. */
export default function StatusPill({
  variant,
  children,
  className = '',
  tone = 'dark',
}: {
  variant: StatusVariant
  children: ReactNode
  className?: string
  tone?: 'dark' | 'cream'
}) {
  const { cls, icon } = config[variant]
  const resolvedCls =
    tone === 'cream' && cls === 'badge-neutral'
      ? 'badge-neutral-on-cream'
      : tone === 'cream' && cls === 'badge-pending'
        ? 'badge-pending-on-cream'
        : cls
  return (
    <span className={`badge ${resolvedCls} ${className}`}>
      {icon}
      {children}
    </span>
  )
}
