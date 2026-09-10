import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Monogram } from '@/components/ui/icons'
import Avatar from '@/components/ui/Avatar'

export default function AppNav() {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()

  return (
    <header className="border-b border-stone bg-paper">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <Monogram size={28} />
          <span className="hidden text-[14px] font-semibold text-ink sm:inline">Become a GTM AI</span>
          {profile?.role === 'mentor' && <span className="pill pill-locked">Mentor</span>}
          {profile?.role === 'admin' && <span className="pill pill-locked">Admin</span>}
        </Link>
        <div className="flex items-center gap-6">
          {profile?.role === 'mentor' && (
            <Link
              to="/mentor"
              className={`border-b-[2px] pb-1 text-[14px] no-underline ${
                pathname.startsWith('/mentor') ? 'border-signal font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Your students
            </Link>
          )}
          {profile?.role === 'admin' && (
            <Link
              to="/admin"
              className={`border-b-[2px] pb-1 text-[14px] no-underline ${
                pathname.startsWith('/admin') ? 'border-signal font-semibold text-ink' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Admin
            </Link>
          )}
          <Link to="/settings" className="flex items-center gap-2 no-underline">
            <Avatar name={profile?.full_name} url={profile?.avatar_url} size={28} />
            <span className="hidden text-[14px] text-body sm:inline">{profile?.full_name ?? 'Settings'}</span>
          </Link>
          <button onClick={() => void signOut()} className="text-[13.5px] font-semibold text-muted hover:text-ink">
            Log out
          </button>
        </div>
      </nav>
    </header>
  )
}
