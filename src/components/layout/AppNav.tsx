import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { Monogram } from '@/components/ui/icons'
import Avatar from '@/components/ui/Avatar'

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-1.5 font-body text-[13px] no-underline ${
    isActive ? 'font-semibold text-text' : 'font-medium text-text-muted hover:text-text'
  }`
}

export default function AppNav() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const unreadMessages = useUnreadMessages()

  // Navigate to the landing page ourselves rather than letting
  // ProtectedRoute's own redirect fire: that redirect attaches the current
  // page as `state.from` so the next login returns here — useful when a
  // session expires mid-browse, but wrong for an explicit "log out", which
  // should always land the next login on the dashboard, not wherever the
  // user happened to click log out from.
  async function handleLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 px-6 py-3.5">
        <Link to="/dashboard" className="flex items-center gap-[9px] no-underline">
          <Monogram size={28} />
          <span className="hidden font-display text-[12px] uppercase leading-none tracking-[0.02em] text-text sm:inline">
            GTM Engineer Bootcamp
          </span>
          {profile?.role === 'mentor' && (
            <span className="pill pill-pending">Mentor</span>
          )}
          {profile?.role === 'admin' && (
            <span className="pill pill-pending">Admin</span>
          )}
        </Link>
        <div className="flex items-center gap-6">
          {profile?.role === 'student' && (
            <NavLink to="/messages" className={navLinkClass}>
              Messages
              <UnreadBadge count={unreadMessages} />
            </NavLink>
          )}
          {profile?.role === 'mentor' && (
            <NavLink to="/mentor" className={navLinkClass}>
              Your students
              <UnreadBadge count={unreadMessages} />
            </NavLink>
          )}
          {profile?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <Link to="/settings" className="flex items-center gap-2 no-underline">
            <Avatar name={profile?.full_name} size={32} />
          </Link>
          <button onClick={() => void handleLogout()} className="btn btn-ghost">
            Log out
          </button>
        </div>
      </nav>
    </header>
  )
}
