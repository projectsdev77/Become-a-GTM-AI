import { Link } from 'react-router-dom'
import { Monogram } from '@/components/ui/icons'
import { LinkButton } from '@/components/ui/Button'

export default function PublicNav() {
  return (
    <header className="border-b border-stone bg-paper">
      <nav className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-3.5 px-4 py-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5 whitespace-nowrap no-underline">
          <Monogram size={32} />
          <span className="text-[16px] font-bold text-ink">Become a GTM AI</span>
        </Link>
        <div className="flex shrink-0 items-center gap-6 whitespace-nowrap">
          <Link to="/curriculum" className="hidden text-[14.5px] font-medium text-body no-underline hover:text-ink sm:inline">
            Curriculum
          </Link>
          <Link to="/login" className="text-[14.5px] font-medium text-body no-underline hover:text-ink">
            Log in
          </Link>
          <LinkButton to="/signup" variant="ink" size="sm">
            Get started
          </LinkButton>
        </div>
      </nav>
    </header>
  )
}
