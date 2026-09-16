import type { HTMLAttributes, ReactNode } from 'react'

export type RowState = 'active' | 'default' | 'pending'

/** The dominant list primitive — a flex row, content left, status right, both wrap.
 *  active = cream (done/complete/current), default = outlined, pending = amber-bordered. */
export default function ListRow({
  state = 'default',
  className = '',
  children,
  ...rest
}: {
  state?: RowState
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  const stateCls = state === 'active' ? 'row-active' : state === 'pending' ? 'row-pending' : 'row-default'
  return (
    <div className={`row ${stateCls} ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function RowTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`row-title ${className}`}>{children}</div>
}

export function RowMeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`row-meta ${className}`}>{children}</div>
}
