import { Link } from 'react-router-dom'
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes, ComponentProps, CSSProperties } from 'react'

export type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'sm'
export type ButtonShadow = 'none' | 'app' | 'accent' | 'reverse'

function buttonClasses(variant: ButtonVariant, size: ButtonSize, className: string) {
  if (variant === 'danger') {
    return `inline-flex min-h-0 items-center gap-1.5 text-[13px] font-semibold text-fail-ink hover:underline disabled:cursor-not-allowed disabled:text-muted ${className}`
  }
  const variantCls: Record<Exclude<ButtonVariant, 'danger'>, string> = {
    primary: 'btn-primary',
    ink: 'btn-ink',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  }
  const sizeCls = size === 'sm' ? 'min-h-[38px] px-4 py-[10px] text-[13.5px]' : ''
  return `btn ${variantCls[variant]} ${sizeCls} ${className}`
}

function shadowStyle(shadow: ButtonShadow): CSSProperties | undefined {
  if (shadow === 'none') return undefined
  return { boxShadow: `var(--shadow-${shadow})` }
}

interface OwnProps {
  variant?: ButtonVariant
  size?: ButtonSize
  shadow?: ButtonShadow
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  shadow = 'none',
  className = '',
  style,
  children,
  ...rest
}: OwnProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses(variant, size, className)} style={{ ...shadowStyle(shadow), ...style }} {...rest}>
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  shadow = 'none',
  className = '',
  style,
  children,
  to,
  ...rest
}: OwnProps & { to: string; style?: CSSProperties } & Omit<ComponentProps<typeof Link>, 'className' | 'children' | 'to' | 'style'>) {
  return (
    <Link to={to} className={buttonClasses(variant, size, className)} style={{ ...shadowStyle(shadow), ...style }} {...rest}>
      {children}
    </Link>
  )
}

export function AnchorButton({
  variant = 'secondary',
  size = 'md',
  shadow = 'none',
  className = '',
  style,
  children,
  ...rest
}: OwnProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClasses(variant, size, className)} style={{ ...shadowStyle(shadow), ...style }} {...rest}>
      {children}
    </a>
  )
}
