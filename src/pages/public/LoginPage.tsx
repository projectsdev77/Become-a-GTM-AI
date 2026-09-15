import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PublicNav from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/Button'
import { Field, Label } from '@/components/ui/Field'
import Callout from '@/components/ui/Callout'
import IllustrationSlot from '@/components/ui/IllustrationSlot'
import { Monogram, AlertIcon, GoogleIcon } from '@/components/ui/icons'

export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/dashboard', { replace: true })
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error)
  }

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      <main className="mx-auto flex max-w-[1160px] flex-wrap items-stretch gap-6 px-6 py-10">
        <section className="flex min-w-[280px] flex-1 flex-[1_1_400px] flex-col rounded-shell border border-line p-10">
          <div className="mb-9 flex items-center gap-[9px]">
            <Monogram size={28} />
            <span className="font-display text-[13px] uppercase leading-none tracking-[0.02em] text-text">
              GTM Engineer
            </span>
          </div>

          <h1 className="font-display text-[clamp(24px,3vw,34px)] uppercase leading-[1.08] text-text">
            Welcome back
          </h1>
          <p className="mt-2.5 text-sm text-text-muted">Pick up where you left off.</p>

          {error && (
            <Callout tone="fail" heading="couldn't log in" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mt-6">
              {error}
            </Callout>
          )}

          <form onSubmit={handleSubmit} className="mt-[26px] flex flex-col gap-[18px]">
            <div>
              <Label htmlFor="email">Email</Label>
              <Field
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <Label htmlFor="password" className="mb-0">
                  Password
                </Label>
                <Link to="/reset-password" className="text-xs font-semibold text-text-muted hover:text-text">
                  Forgot?
                </Link>
              </div>
              <Field
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? 'Logging in…' : 'Log in'}
            </Button>

            <div className="flex items-center gap-3.5">
              <span className="h-px flex-1 bg-line" />
              <span className="font-mono text-[10.5px] text-text-muted">OR</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button type="button" variant="secondary" onClick={() => void handleGoogle()} className="w-full">
              <GoogleIcon size={17} />
              Continue with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-muted">
            New here?{' '}
            <Link to="/signup" className="font-bold text-primary">
              Create an account
            </Link>
          </p>
        </section>

        <section className="hidden min-w-[280px] flex-1 flex-[1_1_400px] sm:flex">
          <IllustrationSlot minHeight={460} className="w-full rounded-shell" />
        </section>
      </main>
    </div>
  )
}
