import { Link } from 'react-router-dom'
import { Monogram } from '@/components/ui/icons'
import { LinkButton } from '@/components/ui/Button'

export default function PublicNav() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-[9px] no-underline">
          <Monogram size={28} />
          <span className="font-display text-[13px] uppercase leading-none tracking-[0.02em] text-text">
            GTM Engineer Bootcamp
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="hidden font-body text-[13px] font-medium text-text-muted no-underline hover:text-text sm:inline">
            Home
          </Link>
          <Link
            to="/curriculum"
            className="hidden font-body text-[13px] font-medium text-text-muted no-underline hover:text-text sm:inline"
          >
            Curriculum
          </Link>
          <Link to="/login" className="font-body text-[13px] font-medium text-text-muted no-underline hover:text-text">
            Log in
          </Link>
          <LinkButton to="/signup" variant="secondary" size="sm">
            Enroll now
          </LinkButton>
        </div>
      </nav>
    </header>
  )
}
