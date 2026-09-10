import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-stone bg-paper px-4 py-3.5 sm:px-6">
      <ol className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 text-[13.5px] text-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-stone-strong">→</span>}
            {item.to ? (
              <Link to={item.to} className="text-muted no-underline hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
