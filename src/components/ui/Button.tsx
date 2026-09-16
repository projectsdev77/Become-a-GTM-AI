import { Link } from 'react-router-dom'
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, ComponentProps } from 'react'

export type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'sm'

// cta carries the signature circular arrow badge — reserved for "leads
// somewhere" navigation, at most twice per screen. Every other action
// (Save, Submit, Send, Update, Create, Cancel) is badge-free.
const BADGED: ButtonVariant[] = ['cta']

function buttonClasses(variant: ButtonVariant, size: ButtonSize, danger: boolean, className: string) {
  const variantCls: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    cta: 'btn-cta',
    secondary: `btn-secondary${danger ? ' danger' : ''}`,
    ghost: 'btn-ghost',
  }
  const sizeCls = size === 'sm' && BADGED.includes(variant) ? 'min-h-[40px]' : size === 'sm' ? 'min-h-[38px] px-4 py-[9px] text-[12.5px]' : ''
  return `btn ${variantCls[variant]} ${sizeCls} ${className}`
}

function content(variant: ButtonVariant, glyph: string, children: ReactNode) {
  if (!BADGED.includes(variant)) return children
  return (
    <>
      <span>{children}</span>
      <span className="btn-badge">{glyph}</span>
    </>
  )
}

interface OwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Outlined destructive treatment for a `secondary` button (e.g. "Remove student"). */
  danger?: boolean
  /** Badge glyph for the `cta` variant. Defaults to the app's signature ↗. */
  glyph?: string
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  danger = false,
  glyph = '↗',
  className = '',
  children,
  ...rest
}: OwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, size, danger, className)} {...rest}>
      {content(variant, glyph, children)}
    </button>
  )
}

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  danger = false,
  glyph = '↗',
  className = '',
  children,
  to,
  ...rest
}: OwnProps & { to: string } & Omit<ComponentProps<typeof Link>, 'className' | 'children' | 'to'>) {
  return (
    <Link to={to} className={buttonClasses(variant, size, danger, className)} {...rest}>
      {content(variant, glyph, children)}
    </Link>
  )
}

export function AnchorButton({
  variant = 'secondary',
  size = 'md',
  danger = false,
  glyph = '↗',
  className = '',
  children,
  ...rest
}: OwnProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClasses(variant, size, danger, className)} {...rest}>
      {content(variant, glyph, children)}
    </a>
  )
}
