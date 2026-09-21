import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import AppNav from '@/components/layout/AppNav'
import Card from '@/components/ui/Card'
import Callout from '@/components/ui/Callout'
import ProgressBar from '@/components/ui/ProgressBar'
import Avatar from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Field, Label, TextAreaField, FieldHint } from '@/components/ui/Field'
import PasswordRequirementsList from '@/components/ui/PasswordRequirementsList'
import { validatePassword } from '@/lib/passwordPolicy'

const HOURS_PRESETS = [2, 4, 6, 10]

function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth()
  const isStudent = profile?.role === 'student'
  const [form, setForm] = useState({ full_name: '', background: '', weekly_hours_target: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        background: profile.background ?? '',
        weekly_hours_target: profile.weekly_hours_target != null ? String(profile.weekly_hours_target) : '',
      })
    }
  }, [profile])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaved(false)
    setError(null)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name || null,
        ...(isStudent
          ? {
              background: form.background || null,
              weekly_hours_target: form.weekly_hours_target ? Number(form.weekly_hours_target) : null,
            }
          : {}),
      })
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setSaved(true)
    await refreshProfile()
  }

  return (
    <>
      <div className="rounded-panel border border-hairline p-7">
        <h2 className="mb-5 text-[19px] font-bold text-heading">Profile</h2>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={form.full_name || profile?.full_name} size={56} />
          <Button type="button" variant="secondary" size="sm">
            Change photo
          </Button>
        </div>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Field id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Field value={user?.email ?? ''} readOnly className="opacity-70" />
          </div>
        </div>
        {isStudent && (
          <div className="mt-[18px]">
            <Label htmlFor="background">Background</Label>
            <TextAreaField
              id="background"
              value={form.background}
              onChange={(e) => setForm({ ...form, background: e.target.value })}
              rows={3}
              placeholder="e.g. 5 years as a backend engineer, new to GTM"
            />
            <FieldHint>Shared with your mentor so they can tailor feedback to your experience.</FieldHint>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-bold text-danger-text">{error}</p>}
        {saved && (
          <Callout tone="pass" className="mt-4">
            Saved.
          </Callout>
        )}

        <Button type="button" variant="primary" onClick={() => void handleSave()} disabled={saving} className="mt-5">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {isStudent && (
        <div className="flex flex-wrap items-center justify-between gap-[clamp(20px,3vw,44px)] rounded-panel border border-hairline p-7">
          <div className="min-w-0 flex-1 basis-[280px]">
            <h2 className="mb-2 text-[19px] font-bold text-heading">Weekly hours target</h2>
            <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
              Sets the pace shown on your dashboard. Be honest — it drives your nudges.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {HOURS_PRESETS.map((preset) => {
                const selected =
                  preset === 10
                    ? Number(form.weekly_hours_target) >= 10
                    : form.weekly_hours_target === String(preset)
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, weekly_hours_target: String(preset) })}
                    className={`flex min-h-11 items-center whitespace-nowrap rounded-pill px-[18px] py-2.5 text-[12.5px] font-semibold ${
                      selected ? 'bg-accent font-bold text-on-accent' : 'border border-border-secondary text-muted'
                    }`}
                  >
                    {preset === 10 ? '10+ hrs' : `${preset} hrs`}
                  </button>
                )
              })}
              <input
                type="number"
                min={1}
                max={80}
                inputMode="numeric"
                placeholder="Custom"
                value={form.weekly_hours_target}
                onChange={(e) => setForm({ ...form, weekly_hours_target: e.target.value })}
                className="field min-h-11 w-[92px] !p-0 text-center text-[12.5px] font-semibold"
              />
            </div>
          </div>
          <div className="shrink-0 text-center">
            <div className="font-display text-[clamp(44px,7vw,64px)] leading-[0.9] text-accent">
              {form.weekly_hours_target || '—'}
            </div>
            <div className="mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Hrs / week</div>
          </div>
        </div>
      )}
    </>
  )
}

function PasswordForm() {
  const { updatePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword

  async function handleSave() {
    setError(null)
    setSaved(false)
    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    setSaving(true)
    const { error } = await updatePassword(newPassword, currentPassword)
    setSaving(false)
    if (error) {
      setError(error)
      return
    }
    setSaved(true)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="rounded-panel border border-hairline p-7">
      <h2 className="mb-5 text-[19px] font-bold text-heading">Password</h2>
      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <div>
          <Label htmlFor="current_password">Current</Label>
          <Field
            id="current_password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="new_password">New</Label>
          <Field
            id="new_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>
      <PasswordRequirementsList password={newPassword} />
      <div className="mt-[18px]">
        <Label htmlFor="confirm_password">Confirm new password</Label>
        <Field
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          error={mismatch}
          placeholder="••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="mt-4 text-sm font-bold text-danger-text">{error}</p>}
      {saved && (
        <Callout tone="pass" className="mt-4">
          Password updated.
        </Callout>
      )}

      <Button
        type="button"
        variant="primary"
        onClick={() => void handleSave()}
        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
        className="mt-5"
      >
        {saving ? 'Updating…' : 'Update password'}
      </Button>
    </div>
  )
}

function DangerZone() {
  const { deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    setDeleting(true)
    const { error } = await deleteAccount()
    setDeleting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="rounded-panel border border-danger-border p-7">
      <h2 className="mb-2 text-[19px] font-bold text-heading">Delete account</h2>
      <p className="mb-5 max-w-[56ch] text-[13.5px] leading-relaxed text-body">
        Removes your submissions, feedback, and certificate permanently. This can&apos;t be undone.
      </p>

      {!confirming ? (
        <Button type="button" variant="secondary" danger onClick={() => setConfirming(true)}>
          Delete my account
        </Button>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="confirm_delete">Type DELETE to confirm</Label>
          <Field
            id="confirm_delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="field-error max-w-xs"
          />
          {error && <p className="text-sm font-bold text-danger-text">{error}</p>}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              danger
              onClick={() => void handleDelete()}
              disabled={confirmText !== 'DELETE' || deleting}
            >
              {deleting ? 'Deleting…' : 'Permanently delete'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirming(false)
                setConfirmText('')
                setError(null)
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { profile } = useAuth()
  const isStudent = profile?.role === 'student'
  const { data } = useProgressOverview()

  const overall = isStudent ? data?.overall : undefined
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-[clamp(28px,5.6vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          Settings
        </h1>

        <div className="mt-7 flex flex-col gap-[clamp(14px,1.8vw,20px)]">
          <ProfileForm />
          <PasswordForm />

          {isStudent && data?.payment_status && (
            <Card>
              <p className="meta">Plan</p>
              <p className="mt-2 font-display text-xl font-bold text-ink-on-cream">
                {data.payment_status === 'paid' ? 'Full access' : 'Free week'}
              </p>
              <p className="mt-1.5 text-[13.5px] text-ink-2-on-cream">
                {data.payment_status === 'paid'
                  ? 'You have full access to all 12 weeks.'
                  : 'Week 1 is free. Contact us to unlock the rest of the program.'}
              </p>
            </Card>
          )}

          {overall && (
            <Card>
              <p className="meta">Overall progress</p>
              <p className="mt-2 font-display text-4xl font-bold text-ink-on-cream">{overallPercent}%</p>
              <div className="mt-3">
                <ProgressBar percent={overallPercent} />
              </div>
            </Card>
          )}

          <DangerZone />
        </div>
      </main>
    </div>
  )
}
