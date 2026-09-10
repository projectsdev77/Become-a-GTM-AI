import type { HTMLAttributes, ReactNode } from 'react'

export type CardVariant = 'default' | 'panel' | 'ink' | 'float'

export default function Card({
  active,
  locked,
  variant = 'default',
  className = '',
  children,
  ...rest
}: {
  active?: boolean
  locked?: boolean
  variant?: CardVariant
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>) {
  const variantCls: Record<CardVariant, string> = {
    default: '',
    panel: 'card-panel',
    ink: 'card-ink',
    float: 'card-float',
  }
  return (
    <div className={`card ${variantCls[variant]} ${locked ? 'card-locked' : ''} ${active ? 'card-active' : ''} ${className}`} {...rest}>
      {children}
    </div>
  )
}
