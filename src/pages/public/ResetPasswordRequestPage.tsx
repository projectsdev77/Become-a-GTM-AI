import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import PublicNav from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/Button'
import { Field, Label } from '@/components/ui/Field'
import Callout from '@/components/ui/Callout'
import { AlertIcon, Monogram } from '@/components/ui/icons'

export default function ResetPasswordRequestPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await requestPasswordReset(email)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[460px] rounded-shell border border-line p-10">
          <div className="mb-8 flex items-center gap-[9px]">
            <Monogram size={28} />
            <span className="font-display text-[13px] uppercase leading-none tracking-[0.02em] text-text">
              GTM Engineer
            </span>
          </div>

          <h1 className="font-display text-[28px] uppercase leading-[1.1] tracking-[-0.02em] text-text">
            Reset your password
          </h1>

          {sent ? (
            <Callout tone="pass" heading="Sent state" className="mt-6">
              Check your inbox — we sent a link to {email} if an account exists for it.
            </Callout>
          ) : (
            <>
              <p className="mt-2.5 text-sm leading-relaxed text-text-muted">
                Enter the email you enrolled with and we&apos;ll send a reset link. It expires in 30 minutes.
              </p>
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Field id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {error && (
                  <Callout tone="fail" heading="Couldn't send link" icon={<AlertIcon className="h-3.5 w-3.5" />}>
                    {error}
                  </Callout>
                )}
                <Button type="submit" variant="primary" disabled={submitting} className="w-full">
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-[13px] text-text-muted">
            <Link to="/login" className="font-bold text-primary">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
