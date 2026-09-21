import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import AppNav from '@/components/layout/AppNav'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import Avatar from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Field, Label, TextAreaField, FieldHint } from '@/components/ui/Field'
import PasswordRequirementsList from '@/components/ui/PasswordRequirementsList'
import { CheckIcon } from '@/components/ui/icons'
import { validatePassword } from '@/lib/passwordPolicy'

const HOURS_PRESETS = [2, 4, 6, 10]
const HOURS_MIN = 1
const HOURS_MAX = 40

function formatPerDay(hours: number) {
  const mins = Math.round((hours * 60) / 7)
  if (mins < 60) return `${mins} minutes`
  const wholeHours = Math.floor(mins / 60)
  const remainder = mins % 60
  return `${wholeHours} h${remainder ? ` ${remainder} min` : ''}`
}

function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth()
  const isStudent = profile?.role === 'student'
  const [form, setForm] = useState({ full_name: '', background: '', weekly_hours_target: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoursStatus, setHoursStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        background: profile.background ?? '',
        weekly_hours_target: profile.weekly_hours_target != null ? String(profile.weekly_hours_target) : '',
      })
    }
  }, [profile])

  const dirty = isStudent
    ? form.full_name !== (profile?.full_name ?? '') || form.background !== (profile?.background ?? '')
    : form.full_name !== (profile?.full_name ?? '')

  async function handleSave() {
    if (!user) return
    setSaving(true)
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
    await refreshProfile()
  }

  async function saveHoursTarget(value: string) {
    if (!user) return
    setHoursStatus('saving')
    const { error } = await supabase
      .from('profiles')
      .update({ weekly_hours_target: value ? Number(value) : null })
      .eq('id', user.id)
    if (error) {
      setHoursStatus('error')
      return
    }
    setHoursStatus('saved')
    await refreshProfile()
    setTimeout(() => setHoursStatus((s) => (s === 'saved' ? 'idle' : s)), 2000)
  }

  function updateHours(nextValue: number) {
    if (Number.isNaN(nextValue)) return
    const clamped = Math.max(HOURS_MIN, Math.min(HOURS_MAX, nextValue))
    const value = String(clamped)
    setForm((f) => ({ ...f, weekly_hours_target: value }))
    void saveHoursTarget(value)
  }

  const numHours = form.weekly_hours_target ? Number(form.weekly_hours_target) : 0
  const displayHours = numHours || 1
  const isCustom = numHours > 0 && !HOURS_PRESETS.includes(numHours)

  return (
    <>
      <div id="profile" className="rounded-panel border border-hairline p-7">
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-5">
          <div className="flex items-center gap-2.5 text-[13.5px]">
            {dirty ? (
              <>
                <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="text-muted">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 text-pass" />
                <span className="text-pass">All changes saved</span>
              </>
            )}
          </div>
          <Button type="button" variant="primary" onClick={() => void handleSave()} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {isStudent && (
        <div id="pace" className="rounded-panel border border-hairline p-7">
          <div className="flex flex-wrap items-center gap-[clamp(20px,3vw,44px)]">
            <div className="min-w-0 flex-1 basis-[280px]">
              <h2 className="mb-2 text-[19px] font-bold text-heading">Weekly hours target</h2>
              <p className="mb-5 text-[13.5px] leading-relaxed text-muted">
                Sets the pace shown on your dashboard. Be honest — it drives your nudges.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {HOURS_PRESETS.map((preset) => {
                  const selected = form.weekly_hours_target === String(preset)
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateHours(preset)}
                      className={`flex min-h-11 items-center whitespace-nowrap rounded-pill px-[18px] py-2.5 text-[12.5px] font-semibold ${
                        selected ? 'bg-accent font-bold text-on-accent' : 'border border-border-secondary text-muted'
                      }`}
                    >
                      {preset} hrs
                    </button>
                  )
                })}
                <div
                  className={`flex min-h-11 items-center gap-2 rounded-pill border px-[18px] ${
                    isCustom ? 'border-accent' : 'border-border-secondary'
                  }`}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label="Custom weekly hours target"
                    min={HOURS_MIN}
                    max={HOURS_MAX}
                    placeholder="Custom"
                    value={form.weekly_hours_target}
                    onChange={(e) => setForm((f) => ({ ...f, weekly_hours_target: e.target.value }))}
                    onBlur={(e) => updateHours(e.target.value ? Number(e.target.value) : displayHours)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                    className={`field !min-h-0 w-[40px] !border-0 !bg-transparent !p-0 text-center text-[12.5px] font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                      isCustom ? 'text-accent' : 'text-display'
                    }`}
                  />
                  <span className={`text-[12.5px] font-semibold ${isCustom ? 'text-accent' : 'text-muted'}`}>hrs</span>
                </div>
              </div>
              {form.weekly_hours_target && (
                <p className="mt-3 text-[13.5px] text-muted">That works out to about {formatPerDay(displayHours)} a day.</p>
              )}
              {hoursStatus !== 'idle' && (
                <p className="mt-1.5 font-mono text-[11px] text-muted">
                  {hoursStatus === 'saving' && 'Saving…'}
                  {hoursStatus === 'saved' && 'Saved.'}
                  {hoursStatus === 'error' && "Couldn't save — try again."}
                </p>
              )}
            </div>
            <div className="shrink-0 text-center">
              <div className="font-display text-[clamp(44px,7vw,64px)] leading-[0.9] text-accent">
                {form.weekly_hours_target || '—'}
              </div>
              <div className="mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Hrs / week</div>
            </div>
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
  const [showPw, setShowPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const matches = confirmPassword.length > 0 && newPassword === confirmPassword
  const pwType = showPw ? 'text' : 'password'

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
    <div id="password" className="rounded-panel border border-hairline p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-[19px] font-bold text-heading">Password</h2>
        <Button type="button" variant="secondary" size="sm" onClick={() => setShowPw((v) => !v)}>
          {showPw ? 'Hide' : 'Show'}
        </Button>
      </div>

      <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        <div className="flex flex-col gap-[18px]">
          <div>
            <Label htmlFor="current_password">Current password</Label>
            <Field
              id="current_password"
              type={pwType}
              autoComplete="current-password"
              placeholder="••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">Confirm new password</Label>
            <Field
              id="confirm_password"
              type={pwType}
              autoComplete="new-password"
              error={mismatch}
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {(mismatch || matches) && (
              <p className={`mt-1.5 text-[12.5px] font-semibold ${mismatch ? 'text-danger-text' : 'text-pass'}`}>
                {mismatch ? "Doesn't match the new password yet." : 'Passwords match.'}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="new_password">New password</Label>
          <Field
            id="new_password"
            type={pwType}
            autoComplete="new-password"
            minLength={8}
            placeholder="••••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <PasswordRequirementsList password={newPassword} />
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-bold text-danger-text">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
        <Button
          type="button"
          variant="primary"
          onClick={() => void handleSave()}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
        >
          {saving ? 'Updating…' : 'Update password'}
        </Button>
        {saved && <p className="text-[13.5px] font-semibold text-pass">Password updated.</p>}
      </div>
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
    <div id="danger" className="rounded-panel border border-danger-border p-7">
      {!confirming ? (
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="min-w-0 flex-1 basis-[280px]">
            <h2 className="mb-2 text-[19px] font-bold text-heading">Delete account</h2>
            <p className="max-w-[56ch] text-[13.5px] leading-relaxed text-body">
              Removes your submissions, feedback, and certificate permanently. This can&apos;t be undone.
            </p>
          </div>
          <Button type="button" variant="secondary" danger onClick={() => setConfirming(true)} className="shrink-0">
            Delete my account
          </Button>
        </div>
      ) : (
        <>
          <h2 className="mb-2 text-[19px] font-bold text-heading">Delete account</h2>
          <p className="mb-5 max-w-[56ch] text-[13.5px] leading-relaxed text-body">
            Removes your submissions, feedback, and certificate permanently. This can&apos;t be undone.
          </p>
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
        </>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { profile } = useAuth()
  const isStudent = profile?.role === 'student'
  const { data } = useProgressOverview()
  const [activeSection, setActiveSection] = useState('profile')

  const overall = isStudent ? data?.overall : undefined
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0

  const sections = isStudent
    ? [
        { id: 'profile', label: 'Profile' },
        { id: 'pace', label: 'Weekly hours' },
        { id: 'password', label: 'Password' },
        { id: 'danger', label: 'Delete account' },
      ]
    : [
        { id: 'profile', label: 'Profile' },
        { id: 'password', label: 'Password' },
        { id: 'danger', label: 'Delete account' },
      ]

  useEffect(() => {
    const ids = sections.map((s) => s.id)

    // A short trailing section (Password, Delete account) can sit well
    // above the viewport's trigger line and just stay there once the page
    // can't scroll any further — it would never "arrive" at that line on
    // its own, so it could never become active. Once the page is scrolled
    // to (or very near) its end, just activate the last section outright.
    function isAtPageBottom() {
      return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (isAtPageBottom()) {
          setActiveSection(ids[ids.length - 1])
          return
        }
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      // Active zone is the top 60% of the viewport — a section counts as
      // "current" once it's scrolled up to a bit above the lower screen
      // line, not only once it reaches the very top.
      { rootMargin: '0px 0px -40% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    function onScroll() {
      if (isAtPageBottom()) setActiveSection(ids[ids.length - 1])
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent])

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[1160px] px-6 py-9">
        <h1 className="mb-7 font-display text-[clamp(28px,5.6vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          Settings
        </h1>

        <div className="flex flex-wrap gap-8">
          <aside className="min-w-[240px] flex-[1_1_280px]">
            <div className="sticky top-5 flex flex-col gap-6">
              <nav aria-label="Settings sections" className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`flex min-h-11 items-center rounded-pill px-[18px] text-[14px] font-semibold no-underline ${
                      activeSection === s.id ? 'bg-inset text-display' : 'text-muted hover:text-display'
                    }`}
                  >
                    {s.label}
                  </a>
                ))}
              </nav>

              {isStudent && data?.payment_status && (
                <Card>
                  <p className="meta">Plan</p>
                  <p className="mt-2 font-display text-xl font-bold text-ink-on-cream">
                    {data.payment_status === 'paid' ? 'Full access' : 'Free week'}
                  </p>
                  <p className="mt-1.5 text-[13.5px] text-ink-2-on-cream">
                    {data.payment_status === 'paid'
                      ? 'You have full access to all 12 weeks.'
                      : 'Week 1 is free — upgrade to unlock weeks 2 through 12.'}
                  </p>

                  {overall && (
                    <>
                      <div className="my-5 h-px bg-cream-rule" />
                      <p className="meta">Overall progress</p>
                      <p className="mt-2 font-display text-4xl font-bold text-ink-on-cream">{overallPercent}%</p>
                      <div className="mt-3">
                        <ProgressBar percent={overallPercent} />
                      </div>
                    </>
                  )}

                  {data.payment_status !== 'paid' && (
                    <LinkButton to="/messages" variant="primary" size="sm" className="mt-5 w-full">
                      Upgrade plan
                    </LinkButton>
                  )}
                </Card>
              )}
            </div>
          </aside>

          <div className="min-w-0 flex-[3_1_560px] space-y-5">
            <ProfileForm />
            <PasswordForm />
            <DangerZone />
          </div>
        </div>
      </main>
    </div>
  )
}
