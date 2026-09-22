import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { functionErrorMessage } from '@/lib/functionsError'
import type { Profile } from '@/types/database'

const SUSPENDED_CHECK_INTERVAL_MS = 60_000

// Google OAuth via signInWithOAuth is "sign in or sign up" by default —
// Supabase silently creates a brand-new account for any Google identity
// that doesn't match an existing one, with no built-in way to ask for
// login-only behavior. There's no way to prevent that account from being
// created in the first place (it happens server-side during the redirect,
// before our code runs again), so instead: the Login page's Google button
// stamps this sessionStorage flag right before redirecting, and once the
// user lands back with a session, a freshly-created-just-now account
// (created_at within this window of "now") gets treated as "no existing
// account" — deleted via the existing delete-account edge function and
// signed back out — rather than silently let in as if they'd signed up.
const OAUTH_LOGIN_INTENT_KEY = 'oauth_login_intent'
const OAUTH_JUST_CREATED_WINDOW_MS = 60_000

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: (intent: 'login' | 'signup') => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string, currentPassword?: string) => Promise<{ error: string | null }>
  deleteAccount: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  // getSession() and onAuthStateChange both fire for the same initial
  // session (a known supabase-js redundancy the pre-existing code already
  // relied on for plain setSession/loadProfile, which is harmless to run
  // twice) — but rejection has a real, one-shot side effect, so whichever
  // of the two loses the race needs to wait on and defer to it rather than
  // finding the sessionStorage flag already cleared and barreling ahead as
  // if this were an ordinary successful login. This ref is that handoff.
  const rejectionInFlight = useRef<Promise<boolean> | null>(null)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data as Profile | null)
  }

  // profiles.last_active_at otherwise never gets written anywhere — the
  // mentor dashboard's "last activity" column and send-reengagement-emails'
  // inactivity filter both read it, but a column nothing ever updates stays
  // null forever (and .lt('last_active_at', ...) never matches a null row,
  // so that edge function has never actually selected anyone). Touching it
  // once per app load is a simple, good-enough "was here recently" signal
  // without writing on every token refresh while a tab sits open.
  function touchLastActive(userId: string) {
    supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
      .then(undefined, () => {})
  }

  // Returns true if this session should be treated as rejected — callers
  // must skip their normal setSession/loadProfile in that case. Safe to
  // call from both getSession and onAuthStateChange for the same initial
  // session: the sessionStorage flag is consumed synchronously (before any
  // await) by whichever call starts first, so it "claims" the rejection
  // and stores its promise in rejectionInFlight; the other call sees the
  // flag already gone but awaits that same promise instead of assuming
  // "nothing to do here" and setting the real session.
  async function rejectIfUnrecognizedGoogleLogin(user: User): Promise<boolean> {
    if (rejectionInFlight.current) return rejectionInFlight.current

    const intent = sessionStorage.getItem(OAUTH_LOGIN_INTENT_KEY)
    sessionStorage.removeItem(OAUTH_LOGIN_INTENT_KEY)
    if (intent !== 'login') return false

    const justCreated = Date.now() - new Date(user.created_at).getTime() < OAUTH_JUST_CREATED_WINDOW_MS
    if (!justCreated) return false

    const promise = (async () => {
      await supabase.functions.invoke('delete-account').catch(() => {})
      await supabase.auth.signOut()
      // A router navigate() here would race RequireAuth's own redirect (it
      // also sends a session-less visitor to /login, from a render of the
      // still-briefly-mounted /dashboard route) — whichever fires last wins
      // the URL, and RequireAuth's plain "/login" has silently clobbered
      // this one's ?error= before. A full reload sidesteps that entirely:
      // the app remounts fresh at this exact URL with no /dashboard render
      // involved.
      window.location.replace(
        `/login?error=${encodeURIComponent('No account found with this Google login. Sign up instead.')}`,
      )
      return true
    })()
    rejectionInFlight.current = promise
    return promise
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      if (data.session?.user && (await rejectIfUnrecognizedGoogleLogin(data.session.user))) {
        setLoading(false)
        return
      }
      setSession(data.session)
      if (data.session?.user) {
        await loadProfile(data.session.user.id)
        touchLastActive(data.session.user.id)
      }
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user && (await rejectIfUnrecognizedGoogleLogin(newSession.user))) {
        return
      }
      setSession(newSession)
      if (newSession?.user) {
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
    // Intentionally run once on mount — loadProfile/touchLastActive/
    // rejectIfUnrecognizedGoogleLogin are redeclared every render but this
    // subscription must not be torn down and recreated on every one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A suspended account's ban (see admin-set-student-status) blocks new
  // logins and token refreshes, but an already-open tab's access token is a
  // stateless JWT — it keeps working for the rest of its ~1hr lifetime
  // regardless of the ban, since that's only checked when a new token is
  // issued. This polls the account's own status so a session that's open
  // *right now* still gets kicked out, instead of quietly working until the
  // token happens to expire. Also re-checks on refocus so a tab suspended
  // while backgrounded is caught the moment someone comes back to it.
  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    async function checkStillActive() {
      const { data } = await supabase.from('profiles').select('status').eq('id', userId as string).single()
      if (data?.status === 'suspended') {
        await supabase.auth.signOut()
        // Same race as rejectIfUnrecognizedGoogleLogin above: signOut()'s
        // SIGNED_OUT event nulls session while loading is already false
        // here (this fires mid-session, well past initial load), so
        // RequireAuth re-renders and issues its own bare "/login" redirect
        // (no error param, since it reads the *current* route's query
        // string, not this one) — a router navigate() here can lose that
        // race and have its ?error= silently clobbered. Full reload avoids
        // the race instead of trying to out-order it.
        window.location.replace(
          `/login?error=${encodeURIComponent('Your account has been suspended. Contact support if this seems wrong.')}`,
        )
      }
    }

    const interval = setInterval(() => void checkStillActive(), SUSPENDED_CHECK_INTERVAL_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void checkStillActive()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [session?.user?.id])

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (!error && data.user) {
      // Fire-and-forget: a failed welcome email should never block signup.
      supabase.functions.invoke('send-welcome-email', { body: { userId: data.user.id } }).catch(() => {})
    }
    // signUp only returns a session when the project doesn't require email
    // confirmation (or already has a valid one). Callers need this to know
    // whether to show a "check your email" state or just continue signed in.
    return { error: error?.message ?? null, needsEmailConfirmation: !error && !data.session }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  async function signInWithGoogle(intent: 'login' | 'signup') {
    if (intent === 'login') {
      sessionStorage.setItem(OAUTH_LOGIN_INTENT_KEY, 'login')
    } else {
      sessionStorage.removeItem(OAUTH_LOGIN_INTENT_KEY)
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (session?.user) {
      await loadProfile(session.user.id)
    }
  }

  async function requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password/confirm`,
    })
    return { error: error?.message ?? null }
  }

  // When currentPassword is supplied (the "change password while logged in"
  // flow, as opposed to the emailed reset-link flow which already proves
  // identity), verify it against the account before applying the change —
  // updateUser alone would let anyone with a live session set a new password
  // without ever proving they knew the old one.
  async function updatePassword(newPassword: string, currentPassword?: string) {
    if (currentPassword) {
      if (!session?.user?.email) {
        return { error: 'Your session has expired. Please log in again.' }
      }
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      })
      if (reauthError) {
        return { error: 'Current password is incorrect.' }
      }
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message ?? null }
  }

  // Deletes the signed-in user's account. The edge function resolves the
  // account to delete from the caller's own verified session token, never
  // from a client-supplied id — see delete-account/index.ts. Signs out
  // locally on success since the session is invalid the moment the user
  // row is gone.
  async function deleteAccount() {
    try {
      const { data, error } = await supabase.functions.invoke('delete-account')
      if (error) {
        return { error: await functionErrorMessage(error) }
      }
      if (data?.error) {
        return { error: data.error as string }
      }
    } catch (e) {
      // A thrown network/CORS failure here (rather than the invoke's own
      // {error} field) would otherwise leave the caller's "Deleting…" state
      // stuck forever with no message — same class of silent-hang bug as
      // evaluate-submission's invoke.
      return { error: e instanceof Error ? e.message : "Couldn't reach the delete-account service." }
    }
    await supabase.auth.signOut()
    return { error: null }
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    requestPasswordReset,
    updatePassword,
    deleteAccount,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
