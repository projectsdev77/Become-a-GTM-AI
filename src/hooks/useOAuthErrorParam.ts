import { useEffect } from 'react'

/**
 * Google OAuth redirects back with ?error=... on failure. That landing route
 * is behind ProtectedRoute, which forwards the message to /login as a query
 * param — this reads it once on mount, hands it to the caller, then strips
 * it from the URL so a refresh doesn't keep re-showing it.
 */
export function useOAuthErrorParam(onError: (message: string) => void) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const message = params.get('error')
    if (!message) return

    onError(message)

    params.delete('error')
    const rest = params.toString()
    window.history.replaceState(null, '', rest ? `${window.location.pathname}?${rest}` : window.location.pathname)
    // Intentionally run once on mount — this reads the URL Google/Supabase
    // redirected back with, not something that should re-fire on rerenders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
