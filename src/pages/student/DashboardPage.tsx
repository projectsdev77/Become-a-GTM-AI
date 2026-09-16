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
import ListRow, { RowMeta, RowTitle } from '@/components/ui/ListRow'
import { LinkButton } from '@/components/ui/Button'
import { CheckIcon, StarIcon } from '@/components/ui/icons'
import Illustration from '@/components/ui/Illustration'
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
        <p className="mt-2 text-[14px] leading-relaxed">
          Set a weekly hours target in{' '}
          <Link to="/settings" className="font-bold text-accent-on-cream">
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
      <p className="mt-2 font-display text-3xl font-bold">
        {formatHours(loggedHours)}
        <span className="text-lg font-body font-normal text-ink-2-on-cream"> / {formatHours(targetHours)} hrs</span>
      </p>
      <div className="mt-3">
        <ProgressBar percent={percent} />
      </div>
      {goalReached ? (
        <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-semibold text-accent-on-cream">
          <CheckIcon className="h-3.5 w-3.5" /> You hit your weekly goal — nice work.
        </p>
      ) : (
        <p className="mt-3 text-[13.5px] text-ink-2-on-cream">{formatHours(remaining)} hrs left to reach your target.</p>
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

  const meta = !week.unlocked
    ? paymentLocked
      ? 'Payment required to unlock'
      : 'Locked until the previous week is complete'
    : complete
    ? `${week.lessons_total} lesson${week.lessons_total === 1 ? '' : 's'} · ${week.assignments_total} assignment${
        week.assignments_total === 1 ? '' : 's'
      } done`
    : isCurrent
    ? `Lesson ${week.lessons_completed} of ${week.lessons_total} · in progress`
    : `${week.lessons_completed} of ${week.lessons_total} lessons done`

  const content = (
    <ListRow state={week.unlocked ? 'active' : 'default'}>
      <div className="min-w-0">
        <RowTitle className="truncate">
          Week {String(week.position).padStart(2, '0')} · {week.title}
        </RowTitle>
        <RowMeta>{meta}</RowMeta>
      </div>
      {!week.unlocked ? (
        <StatusPill variant="locked" tone="dark">
          {paymentLocked ? 'Payment required' : 'Locked'}
        </StatusPill>
      ) : complete ? (
        <StatusPill variant="pass" tone="cream">
          Complete
        </StatusPill>
      ) : (
        <StatusPill variant="progress" tone="cream">
          In progress
        </StatusPill>
      )}
    </ListRow>
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
        {error && <p className="text-sm font-bold text-danger-text">Couldn't load your progress: {error}</p>}
        {!error && data?.enrolled === false && (
          <p className="text-sm text-muted">You're not enrolled yet — this shouldn't happen; contact support.</p>
        )}

        {active && (
          <div className="flex flex-wrap items-end justify-between gap-6 pb-9">
            <div>
              <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                Continue where you left off
              </p>
              <h1 className="mb-4.5 font-display text-[clamp(26px,3.6vw,40px)] uppercase leading-[1.05] text-display">
                Week {String(active.position).padStart(2, '0')} — {active.title}
              </h1>
              <div className="flex items-center gap-3">
                <ProgressBar percent={activePercent} className="w-[200px] max-w-[50vw]" />
                <span className="font-mono text-[11px] text-muted">{activePercent}%</span>
              </div>
            </div>
            <LinkButton to={`/weeks/${active.week_id}`} variant="cta" className="shrink-0">
              Continue
            </LinkButton>
          </div>
        )}

        {paymentLockActive && (
          <Callout tone="warn" heading="Weeks 2–12 need unlocking" className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>Week 1 is free — weeks 2 through 12 unlock once you're on a paid plan.</p>
              <LinkButton to="/messages" variant="cta" size="sm" className="shrink-0">
                Message your mentor
              </LinkButton>
            </div>
          </Callout>
        )}

        <div className="rounded-shell border border-hairline p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-xl font-bold text-heading">Your 12 weeks</h2>
            <p className="max-w-[420px] text-[14.5px] leading-[1.55] text-muted">
              Each week is four to five lessons and one graded build. Finish the build to open the next week.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
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
            <div className="rounded-panel border border-hairline p-6 sm:col-span-2 lg:col-span-1">
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.08em] text-muted">
                <StarIcon className="h-3.5 w-3.5" /> track complete
              </p>
              <div className="mt-4">
                <Illustration slot="v4-cert" loading="lazy" className="w-full" style={{ aspectRatio: '43/24', borderRadius: 14 }} />
              </div>
              <p className="mt-4 font-display text-xl uppercase text-display">You completed the track!</p>
              <p className="mt-1 text-[14.5px] text-muted">Your certificate is ready to share.</p>
              <LinkButton to={`/certificates/${certificateCode}`} variant="primary" className="mt-4 w-full">
                View certificate
              </LinkButton>
            </div>
          )}

          <WeeklyHoursCard />

          {overall && (
            <Card>
              <p className="meta">Overall progress</p>
              <p className="mt-2 font-display text-5xl font-bold">
                {overallPercent}
                <span className="text-2xl">%</span>
              </p>
              <div className="mt-3">
                <ProgressBar percent={overallPercent} />
              </div>
              <dl className="mt-5 space-y-2 border-t border-cream-rule pt-4 text-[13.5px]">
                <div className="flex justify-between">
                  <dt className="meta">Lessons done</dt>
                  <dd className="font-bold">
                    {lessonsCompleted}/{lessonsTotal}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="meta">Submissions</dt>
                  <dd className="font-bold">{submissionsCount}</dd>
                </div>
              </dl>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
