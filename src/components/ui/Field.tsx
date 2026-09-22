import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'
import { ChevronDownIcon } from './icons'

export function Label({ children, className = '', ...rest }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label className={`label mb-2 block ${className}`} {...rest}>
      {children}
    </label>
  )
}

export function Field({ error, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={`field ${error ? 'field-error' : ''} ${className}`} {...rest} />
}

export function TextAreaField({
  error,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea className={`field ${error ? 'field-error' : ''} ${className}`} {...rest} />
}

export function SelectField({ error, className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <span className="relative block">
      <select className={`field appearance-none pr-10 ${error ? 'field-error' : ''} ${className}`} {...rest}>
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
    </span>
  )
}

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[12.5px] font-semibold text-danger-text">{children}</p>
}

export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[13px] text-muted">{children}</p>
}
