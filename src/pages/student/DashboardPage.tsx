import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { currentWeek, isWeekComplete, useProgressOverview, type WeekProgress } from '@/hooks/useProgressOverview'
import { useMyCertificate } from '@/hooks/useMyCertificate'
import AppNav from '@/components/layout/AppNav'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusPill from '@/components/ui/StatusPill'
import Callout from '@/components/ui/Callout'
import { LinkButton } from '@/components/ui/Button'
import { StarIcon, LockIcon } from '@/components/ui/icons'
import { IllComplete } from '@/components/ui/illustrations'
import { FullPageSpinner } from '@/routes/ProtectedRoute'

function WeekRow({ week, isCurrent }: { week: WeekProgress; isCurrent: boolean }) {
  const totalUnits = week.lessons_total + week.assignments_total
  const doneUnits = week.lessons_completed + week.assignments_done
  const percent = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0
  const complete = isWeekComplete(week) && totalUnits > 0

  const content = (
    <div className={`card flex items-center gap-4 ${!week.unlocked ? 'card-locked' : ''} ${isCurrent ? 'card-active' : ''}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold ${
          complete
            ? 'bg-pass-wash text-pass-ink'
            : week.unlocked
              ? 'bg-signal-wash text-signal-ink'
              : 'bg-panel text-muted'
        }`}
      >
        {complete ? '✓' : week.unlocked ? week.position : <LockIcon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`font-display text-lg font-bold ${week.unlocked ? 'text-ink' : 'text-muted'}`}>
          Week {week.position}: {week.title}
        </p>
        {week.unlocked ? (
          <>
            {week.goal && <p className="mt-0.5 truncate text-[14.5px] text-muted">{week.goal}</p>}
            <div className="mt-2.5 flex max-w-xs items-center gap-3">
              <ProgressBar percent={percent} />
              <span className="shrink-0 font-mono text-[11px] font-semibold text-muted">{doneUnits}/{totalUnits || 0}</span>
            </div>
          </>
        ) : (
          <p className="mt-0.5 text-[14.5px] text-muted" aria-label={`Week ${week.position}, locked, finish the previous week first`}>
            Locked — finish the previous week first
          </p>
        )}
      </div>
      <span className="shrink-0">
        {complete && <StatusPill variant="pass">complete</StatusPill>}
        {!complete && week.unlocked && <StatusPill variant="progress">in progress</StatusPill>}
        {!week.unlocked && <StatusPill variant="locked">locked</StatusPill>}
      </span>
    </div>
  )

  if (!week.unlocked) return <div aria-disabled="true">{content}</div>
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
  const activeUnitsLeft = active
    ? active.lessons_total + active.assignments_total - active.lessons_completed - active.assignments_done
    : 0
  const lessonsTotal = weeks.reduce((sum, w) => sum + w.lessons_total, 0)
  const lessonsCompleted = weeks.reduce((sum, w) => sum + w.lessons_completed, 0)
  const submissionsCount = weeks.reduce((sum, w) => sum + w.assignments_done, 0)

  const visibleWeeks = weeks.slice(0, 4)
  const collapsedWeeks = weeks.slice(4)

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        <p className="eyebrow">Week {active?.position ?? '—'} of 12 · {overallPercent}% complete</p>
        <h1 className="mt-2 font-display text-[38px] font-bold tracking-[-0.035em] text-ink">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>

        {error && <p className="mt-4 text-sm font-bold text-fail-ink">Couldn't load your progress: {error}</p>}
        {!error && data?.enrolled === false && (
          <p className="mt-4 text-sm text-muted">You're not enrolled yet — this shouldn't happen; contact support.</p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_0.85fr]">
          <div>
            {active && (
              <div className="card-ink flex flex-col gap-4 rounded-panel p-6 sm:flex-row sm:items-center sm:justify-between" style={{ boxShadow: 'var(--shadow-accent)' }}>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-signal-light">
                    Continue where you left off
                  </p>
                  <p className="mt-1.5 font-display text-2xl font-bold text-paper">
                    Week {active.position}: {active.title}
                  </p>
                  {activeUnitsLeft > 0 && (
                    <p className="mt-1 text-[13.5px] text-paper/60">{activeUnitsLeft} item{activeUnitsLeft === 1 ? '' : 's'} left this week</p>
                  )}
                </div>
                <LinkButton to={`/weeks/${active.week_id}`} variant="primary" className="shrink-0">
                  Continue
                </LinkButton>
              </div>
            )}

            <p className="eyebrow mt-8">Twelve weeks</p>
            <div className="mt-3 space-y-3">
              {visibleWeeks.map((week) => (
                <WeekRow key={week.week_id} week={week} isCurrent={week.week_id === active?.week_id} />
              ))}
              {collapsedWeeks.length > 0 && (
                <p className="py-2 text-center font-mono text-[12px] text-muted">
                  + {collapsedWeeks.length} more weeks below — keep going to reveal them
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {certificateCode && (
              <div className="card-panel rounded-panel p-6">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.06em] text-signal">
                  <StarIcon className="h-3.5 w-3.5" /> Track complete
                </p>
                <div className="ill-frame mt-4 aspect-[25/12] text-ink">
                  <IllComplete />
                </div>
                <p className="mt-4 font-display text-xl font-bold text-ink">You completed the track!</p>
                <p className="mt-1 text-[14.5px] text-muted">Your certificate is ready to share.</p>
                <LinkButton to={`/certificates/${certificateCode}`} variant="primary" className="mt-4 w-full">
                  View certificate
                </LinkButton>
              </div>
            )}

            {overall && (
              <div className="card">
                <p className="meta">Overall progress</p>
                <p className="mt-2 font-display text-[44px] font-bold leading-none text-ink">
                  {overallPercent}
                  <span className="text-2xl">%</span>
                </p>
                <div className="mt-3">
                  <ProgressBar percent={overallPercent} tone="ink" />
                </div>
                <dl className="mt-5 space-y-2 border-t border-stone pt-4 text-[13.5px]">
                  <div className="flex justify-between">
                    <dt className="meta">Lessons done</dt>
                    <dd className="font-semibold text-ink">
                      {lessonsCompleted}/{lessonsTotal}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="meta">Submissions</dt>
                    <dd className="font-semibold text-ink">{submissionsCount}</dd>
                  </div>
                </dl>
              </div>
            )}

            <Callout tone="info" heading="how unlocking works" icon={<LockIcon className="h-3.5 w-3.5" />}>
              Finish every lesson and pass the week's assignment to unlock the next one automatically.
            </Callout>
          </div>
        </div>
      </main>
    </div>
  )
}
