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
        <div className="w-full max-w-[480px] rounded-shell border border-hairline p-10">
          <div className="mb-8 flex items-center gap-[9px]">
            <Monogram size={28} />
            <span className="font-display text-[13px] uppercase leading-none tracking-[0.02em] text-display">
              GTM Engineer
            </span>
          </div>

          <h1 className="font-display text-[clamp(26px,4.4vw,32px)] uppercase leading-[0.96] tracking-[-0.02em] text-display">
            Reset your password
          </h1>

          {sent ? (
            <div className="mt-6 rounded-panel bg-cream p-5 text-ink-on-cream">
              <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-label-on-cream">
                Sent state
              </p>
              <p className="mb-1.5 text-[15px] font-bold">Check your inbox</p>
              <p className="text-[13.5px] leading-relaxed text-ink-2-on-cream">
                We sent a link to {email} if an account exists for it.
              </p>
            </div>
          ) : (
            <>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
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
                <Button type="submit" variant="cta" disabled={submitting} className="w-full">
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-[13px] text-muted">
            <Link to="/login" className="font-bold text-accent">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
