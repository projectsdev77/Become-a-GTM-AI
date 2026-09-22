import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import Callout from '@/components/ui/Callout'
import { AlertIcon } from '@/components/ui/icons'

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ground">
      <p className="meta">loading…</p>
    </div>
  )
}

function FullPageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ground px-4">
      <div className="w-full max-w-[420px]">
        <Callout tone="fail" heading="Couldn't load your account" icon={<AlertIcon className="h-3.5 w-3.5" />}>
          {message}
        </Callout>
        <Button type="button" variant="secondary" onClick={onRetry} className="mt-4 w-full">
          Try again
        </Button>
      </div>
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
  const { profile, profileError, loading, refreshProfile } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!profile) {
    // profileError set means the fetch itself failed (network blip, etc.)
    // — show a real error with a retry instead of a spinner that would
    // otherwise never resolve, since nothing else here re-fetches it.
    if (profileError) {
      return <FullPageError message={profileError} onRetry={() => void refreshProfile()} />
    }
    return <FullPageSpinner />
  }
  if (!roles.includes(profile.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
