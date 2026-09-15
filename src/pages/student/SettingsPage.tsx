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

const HOURS_PRESETS = [2, 5, 8, 12]

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
      <div className="rounded-panel border border-line p-7">
        <p className="mb-5 text-base font-bold text-text-bright">Profile</p>
        <div className="mb-6 flex items-center gap-4">
          <Avatar name={form.full_name || profile?.full_name} size={52} />
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

        {error && <p className="mt-4 text-sm font-bold text-fail-text">{error}</p>}
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
        <div className="rounded-panel border border-line p-7">
          <p className="mb-1.5 text-base font-bold text-text-bright">Weekly hours target</p>
          <p className="mb-5 text-[13.5px] leading-relaxed text-text-muted">
            Sets the pace shown on your dashboard. You can change it any week.
          </p>

          <div className="mb-6 flex items-end gap-2.5">
            <span className="font-display text-[40px] leading-none text-text-bright">
              {form.weekly_hours_target || '—'}
            </span>
            <span className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-text-muted">Hrs/week</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {HOURS_PRESETS.map((preset) => {
              const selected =
                preset === 12
                  ? Number(form.weekly_hours_target) >= 12
                  : form.weekly_hours_target === String(preset)
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setForm({ ...form, weekly_hours_target: String(preset) })}
                  className={`rounded-pill px-5 py-2.5 text-[13.5px] font-semibold ${
                    selected ? 'bg-card-light text-on-light' : 'border border-line text-text-body hover:border-line-strong'
                  }`}
                >
                  {preset === 12 ? '12+ hrs' : `${preset} hrs`}
                </button>
              )
            })}
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
    <div className="rounded-panel border border-line p-7">
      <p className="mb-5 text-base font-bold text-text-bright">Password</p>
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

      {error && <p className="mt-4 text-sm font-bold text-fail-text">{error}</p>}
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
    <div className="rounded-panel p-7" style={{ border: '1px solid var(--color-fail-border)' }}>
      <p className="mb-1.5 text-base font-bold text-text-bright">Delete account</p>
      <p className="mb-5 max-w-[56ch] text-[13.5px] leading-relaxed text-text-muted">
        Removes your submissions, feedback, and certificate. This can't be undone.
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
            className="max-w-xs"
            style={{ borderColor: 'var(--color-fail-border)' }}
          />
          {error && <p className="text-sm font-bold text-fail-text">{error}</p>}
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
      <main className="mx-auto max-w-[820px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-[clamp(24px,3.2vw,34px)] uppercase text-text">Settings</h1>

        <div className="mt-7 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          <ProfileForm />
          <PasswordForm />

          {isStudent && data?.payment_status && (
            <Card>
              <p className="meta">Plan</p>
              <p className="mt-2 font-display text-xl font-bold text-on-light">
                {data.payment_status === 'paid' ? 'Full access' : 'Free week'}
              </p>
              <p className="mt-1.5 text-[13.5px] text-on-light-mute">
                {data.payment_status === 'paid'
                  ? 'You have full access to all 12 weeks.'
                  : 'Week 1 is free. Contact us to unlock the rest of the program.'}
              </p>
            </Card>
          )}

          {overall && (
            <Card>
              <p className="meta">Overall progress</p>
              <p className="mt-2 font-display text-4xl font-bold text-on-light">{overallPercent}%</p>
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
