import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/curriculum', label: 'Curriculum' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/broken-links', label: 'Broken links' },
  { to: '/admin/certificate', label: 'Certificate' },
] as const

export default function AdminNav() {
  return (
    <div className="border-b border-stone bg-panel">
      <nav className="mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={'end' in tab ? tab.end : false}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-[2px] px-4 py-3 text-[13.5px] no-underline ${
                isActive ? 'border-signal font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
