import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { currentWeek, isPaymentLocked, isWeekComplete, useProgressOverview, type WeekProgress } from '@/hooks/useProgressOverview'
import type { PaymentStatus } from '@/types/database'
import { useMyCertificate } from '@/hooks/useMyCertificate'
import { useWeeklyHours } from '@/hooks/useWeeklyHours'
import AppNav from '@/components/layout/AppNav'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusPill from '@/components/ui/StatusPill'
import Callout from '@/components/ui/Callout'
import Card from '@/components/ui/Card'
import { LinkButton } from '@/components/ui/Button'
import { StarIcon, LockIcon } from '@/components/ui/icons'
import IllustrationSlot from '@/components/ui/IllustrationSlot'
import { FullPageSpinner } from '@/routes/ProtectedRoute'

function formatHours(hours: number) {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1)
}

function WeeklyHoursCard() {
  const { data } = useWeeklyHours()
  if (!data) return null

  if (data.target_hours == null) {
    return (
      <Card>
        <p className="meta">This week</p>
        <p className="mt-2 text-[14px] leading-relaxed text-on-light-mute">
          Set a weekly hours target in{' '}
          <Link to="/settings" className="font-bold text-primary">
            Settings
          </Link>{' '}
          to track how much time you're putting in each week.
        </p>
      </Card>
    )
  }

  const loggedHours = data.logged_minutes / 60
  const targetHours = data.target_hours
  const percent = targetHours > 0 ? Math.min(100, Math.round((loggedHours / targetHours) * 100)) : 0
  const remaining = Math.max(0, targetHours - loggedHours)
  const goalReached = loggedHours >= targetHours

  return (
    <Card>
      <p className="meta">This week</p>
      <p className="mt-2 font-display text-3xl font-bold text-on-light">
        {formatHours(loggedHours)}
        <span className="text-lg text-on-light-mute"> / {formatHours(targetHours)} hrs</span>
      </p>
      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>
      {goalReached ? (
        <Callout tone="pass" className="mt-4">
          You hit your weekly goal — nice work.
        </Callout>
      ) : (
        <p className="mt-3 text-[13.5px] text-on-light-mute">{formatHours(remaining)} hrs left to reach your target.</p>
      )}
    </Card>
  )
}

function WeekRow({
  week,
  allWeeks,
  paymentStatus,
  isCurrent,
}: {
  week: WeekProgress
  allWeeks: WeekProgress[]
  paymentStatus?: PaymentStatus
  isCurrent: boolean
}) {
  const complete = isWeekComplete(week) && week.lessons_total + week.assignments_total > 0
  const paymentLocked = isPaymentLocked(allWeeks, week, paymentStatus)

  const content = (
    <Card active={isCurrent} locked={!week.unlocked} className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="meta mb-1">Week {String(week.position).padStart(2, '0')}</p>
        <p className="truncate font-bold">{week.title}</p>
      </div>
      {complete && (
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-pass-deep text-xs text-white">
          ✓
        </span>
      )}
      {!complete && isCurrent && (
        <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ground-ink text-xs text-white">
          ↗
        </span>
      )}
      {!week.unlocked && (
        <span className="shrink-0 text-[13px] text-text-muted" aria-label={paymentLocked ? 'payment required' : 'locked'}>
          🔒
        </span>
      )}
      {!complete && !isCurrent && week.unlocked && <StatusPill variant="progress">in progress</StatusPill>}
    </Card>
  )

  if (!week.unlocked) return content
  return (
    <Link to={`/weeks/${week.week_id}`} className="block no-underline">
      {content}
    </Link>
  )
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data, loading, error } = useProgressOverview()
  const certificateCode = useMyCertificate()

  if (loading) return <FullPageSpinner />

  // /dashboard is the one landing page every login flow (email, signup,
  // Google OAuth) sends everyone to, since none of them know the caller's
  // role until the profile has loaded. Bounce mentors/admins on to their
  // own home from here rather than teaching every entry point about roles.
  if (profile?.role === 'mentor') return <Navigate to="/mentor" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  const weeks = data?.weeks ?? []
  const overall = data?.overall
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0
  const active = currentWeek(weeks)
  const activeTotalUnits = active ? active.lessons_total + active.assignments_total : 0
  const activeDoneUnits = active ? active.lessons_completed + active.assignments_done : 0
  const activePercent = activeTotalUnits > 0 ? Math.round((activeDoneUnits / activeTotalUnits) * 100) : 0
  const lessonsTotal = weeks.reduce((sum, w) => sum + w.lessons_total, 0)
  const lessonsCompleted = weeks.reduce((sum, w) => sum + w.lessons_completed, 0)
  const submissionsCount = weeks.reduce((sum, w) => sum + w.assignments_done, 0)
  const paymentLockActive = Boolean(
    data?.payment_status && data.payment_status !== 'paid' && weeks.some((w) => isPaymentLocked(weeks, w, data.payment_status)),
  )

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[1160px] px-6 py-9">
        {error && <p className="text-sm font-bold text-fail-text">Couldn't load your progress: {error}</p>}
        {!error && data?.enrolled === false && (
          <p className="text-sm text-text-muted">You're not enrolled yet — this shouldn't happen; contact support.</p>
        )}

        {active && (
          <div className="flex flex-wrap items-end justify-between gap-6 pb-9">
            <div>
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
                Continue where you left off
              </p>
              <h1 className="mb-4.5 font-display text-[clamp(26px,3.6vw,40px)] uppercase leading-[1.05] text-text">
                Week {String(active.position).padStart(2, '0')} — {active.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="h-[6px] w-[200px] max-w-[50vw] overflow-hidden rounded-pill bg-line">
                  <div className="h-full rounded-pill bg-primary" style={{ width: `${activePercent}%` }} />
                </div>
                <span className="font-mono text-[11px] text-text-muted">{activePercent}%</span>
              </div>
            </div>
            <LinkButton to={`/weeks/${active.week_id}`} variant="site" className="shrink-0">
              Continue
            </LinkButton>
          </div>
        )}

        <div className="rounded-shell border border-line p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-xl font-bold text-text-bright">Your 12 weeks</h2>
            {paymentLockActive && (
              <div className="flex max-w-[520px] items-start gap-3 rounded-card border border-[rgba(238,72,35,.5)] px-4.5 py-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
                  !
                </span>
                <p className="text-[12.5px] leading-[1.55] text-text-body">
                  Week 1 is free — weeks 2–12 unlock with payment. <em className="text-text-muted">[copy pending]</em>{' '}
                  <a href="#" className="font-bold text-primary">
                    Contact us to unlock →
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))' }}>
            {weeks.map((week) => (
              <WeekRow
                key={week.week_id}
                week={week}
                allWeeks={weeks}
                paymentStatus={data?.payment_status}
                isCurrent={week.week_id === active?.week_id}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificateCode && (
            <div className="rounded-panel border border-line p-6 sm:col-span-2 lg:col-span-1">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">
                <StarIcon className="h-3.5 w-3.5" /> track complete
              </p>
              <div className="mt-4">
                <IllustrationSlot ratio="43/24" />
              </div>
              <p className="mt-4 font-display text-xl uppercase text-text">You completed the track!</p>
              <p className="mt-1 text-[14.5px] text-text-muted">Your certificate is ready to share.</p>
              <LinkButton to={`/certificates/${certificateCode}`} variant="site" className="mt-4 w-full">
                View certificate
              </LinkButton>
            </div>
          )}

          <WeeklyHoursCard />

          {overall && (
            <Card>
              <p className="meta">Overall progress</p>
              <p className="mt-2 font-display text-5xl font-bold text-on-light">
                {overallPercent}
                <span className="text-2xl">%</span>
              </p>
              <div className="mt-3">
                <ProgressBar percent={overallPercent} />
              </div>
              <dl className="mt-5 space-y-2 border-t border-line-strong/40 pt-4 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="meta">Lessons done</dt>
                  <dd className="font-bold text-on-light">
                    {lessonsCompleted}/{lessonsTotal}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="meta">Submissions</dt>
                  <dd className="font-bold text-on-light">{submissionsCount}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
