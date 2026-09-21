import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ground">
      <p className="meta">loading…</p>
    </div>
  )
}

/** Requires a signed-in user; otherwise redirects to /login. Login always lands on /dashboard — it never resumes the attempted path. */
export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner />
  if (!session) {
    // A failed Google OAuth exchange redirects here (redirectTo is always
    // /dashboard) with ?error=... — forward it to /login instead of
    // silently dropping it, so the failure is visible instead of looking
    // like a random bounce.
    const params = new URLSearchParams(location.search)
    const oauthError = params.get('error_description') || params.get('error')
    return <Navigate to={oauthError ? `/login?error=${encodeURIComponent(oauthError)}` : '/login'} replace />
  }
  return <Outlet />
}

/** Requires the signed-in user's profile role to be one of `roles`; otherwise redirects home. */
export function RequireRole({ roles }: { roles: Array<'student' | 'mentor' | 'admin'> }) {
  const { profile, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!profile) return <FullPageSpinner />
  if (!roles.includes(profile.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
