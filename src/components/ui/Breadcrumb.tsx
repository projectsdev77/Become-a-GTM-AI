import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11.5px]">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-border-secondary">/</span>}
          {item.to ? (
            <Link to={item.to} className="text-muted no-underline hover:text-display">
              {item.label}
            </Link>
          ) : (
            <span className="text-display">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  )
}
