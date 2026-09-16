import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/curriculum', label: 'Curriculum' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/mentors', label: 'Mentors' },
  { to: '/admin/broken-links', label: 'Broken links' },
  { to: '/admin/certificate', label: 'Certificate' },
] as const

export default function AdminNav() {
  return (
    <div className="border-b border-hairline bg-shell">
      <nav className="mx-auto flex max-w-[1160px] gap-1 overflow-x-auto px-6">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={'end' in tab ? tab.end : false}
            className={({ isActive }) =>
              `whitespace-nowrap border-b-2 px-4 py-3 font-body text-[13px] no-underline ${
                isActive
                  ? 'border-accent font-semibold text-display'
                  : 'border-transparent font-medium text-muted hover:text-display'
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
