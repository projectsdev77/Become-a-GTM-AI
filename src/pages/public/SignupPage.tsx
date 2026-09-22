import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useOAuthErrorParam } from '@/hooks/useOAuthErrorParam'
import PublicNav from '@/components/layout/PublicNav'
import { Button, LinkButton } from '@/components/ui/Button'
import { Field, Label } from '@/components/ui/Field'
import Callout from '@/components/ui/Callout'
import Illustration from '@/components/ui/Illustration'
import { AlertIcon, GoogleIcon } from '@/components/ui/icons'
import PasswordRequirementsList from '@/components/ui/PasswordRequirementsList'
import { validatePassword } from '@/lib/passwordPolicy'

export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  useOAuthErrorParam(setError)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    setSubmitting(true)
    const { error, needsEmailConfirmation } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    // Signup automatically enrolls the student (trigger-driven, PD-001/A-003)
    // once their session exists. If the project requires email confirmation
    // there's no session yet, so show a "check your email" state instead —
    // otherwise the user is already signed in, so go straight in.
    if (needsEmailConfirmation) {
      setConfirmSent(true)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle('signup')
    if (error) setError(error)
  }

  if (confirmSent) {
    return (
      <div className="min-h-screen bg-ground">
        <PublicNav />
        <main className="flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-[440px] rounded-shell border border-hairline p-10 text-center">
            <Callout tone="pass" heading="check your email" className="text-left">
              We sent a confirmation link to {email}. Click it to activate your account, then log in.
            </Callout>
            <LinkButton to="/login" variant="secondary" className="mt-6 w-full">
              Go to login
            </LinkButton>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      <main className="mx-auto flex max-w-[1160px] flex-wrap items-stretch gap-6 px-6 py-10">
        <section className="min-w-[280px] flex-1 flex-[1_1_400px]">
          <Illustration
            slot="v4-auth-2"
            loading="eager"
            className="h-full w-full rounded-shell"
            style={{ flex: '1 1 380px', minWidth: 280, minHeight: 520 }}
          />
        </section>

        <section className="flex min-w-[280px] flex-1 flex-[1_1_400px] flex-col rounded-shell border border-hairline p-10">
          <h1 className="font-display text-[clamp(24px,3vw,34px)] uppercase leading-[1.08] text-display">
            Start week 1 free
          </h1>
          <p className="mt-2.5 text-sm text-muted">No card needed to finish the first week.</p>

          {error && (
            <Callout tone="fail" heading="couldn't sign up" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mt-6">
              {error}
            </Callout>
          )}

          <form onSubmit={handleSubmit} className="mt-[26px] flex flex-col gap-[18px]">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Field
                id="fullName"
                type="text"
                required
                placeholder="Alex Moreno"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
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
              <Label htmlFor="password">Password</Label>
              <Field
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordRequirementsList password={password} />
            </div>

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>

            <div className="flex items-center gap-3.5">
              <span className="h-px flex-1 bg-hairline" />
              <span className="font-mono text-[10.5px] text-muted">OR</span>
              <span className="h-px flex-1 bg-hairline" />
            </div>

            <Button type="button" variant="secondary" onClick={() => void handleGoogle()} className="w-full gap-2.5">
              <GoogleIcon size={17} />
              Continue with Google
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            Already enrolled?{' '}
            <Link to="/login" className="font-bold text-accent">
              Log in
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
