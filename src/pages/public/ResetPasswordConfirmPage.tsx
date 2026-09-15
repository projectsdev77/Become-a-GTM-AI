import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PublicNav from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/Button'
import { Field, Label, FieldError } from '@/components/ui/Field'
import Callout from '@/components/ui/Callout'
import { AlertIcon } from '@/components/ui/icons'
import PasswordRequirementsList from '@/components/ui/PasswordRequirementsList'
import { validatePassword } from '@/lib/passwordPolicy'

// Reached via the link in the reset email. Supabase's client library
// exchanges the URL's recovery token for a session automatically on load
// (detectSessionInUrl, on by default), so by the time this renders the
// user already has an active (recovery-scoped) session and can call
// updateUser directly.
export default function ResetPasswordConfirmPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[460px] rounded-shell border border-line p-10">
          {done ? (
            <>
              <Callout tone="pass" heading="Password updated">
                You can now log in with your new password.
              </Callout>
              <Button variant="primary" onClick={() => navigate('/dashboard')} className="mt-6 w-full">
                Go to dashboard
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-[28px] uppercase leading-[1.1] tracking-[-0.02em] text-text">
                Choose a new password
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                You&apos;re resetting your account password.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Field
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <PasswordRequirementsList password={password} />
                </div>

                <div>
                  <Label htmlFor="confirm_password">Confirm password</Label>
                  <Field
                    id="confirm_password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={mismatch}
                  />
                  {mismatch && <FieldError>Passwords don&apos;t match yet.</FieldError>}
                </div>

                {error && (
                  <Callout tone="fail" heading="Couldn't update password" icon={<AlertIcon className="h-3.5 w-3.5" />}>
                    {error}
                  </Callout>
                )}
                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? 'Saving…' : 'Save new password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
