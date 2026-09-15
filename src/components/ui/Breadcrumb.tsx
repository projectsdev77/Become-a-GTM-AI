import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="border-b border-line bg-ground-deep px-4 py-3.5 sm:px-6">
      <ol className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-2 font-mono text-xs lowercase">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-text-muted">/</span>}
            {item.to ? (
              <Link to={item.to} className="text-primary no-underline hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-bold text-text-bright">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
