import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { LinkButton } from '@/components/ui/Button'
import ListRow, { RowTitle, RowMeta } from '@/components/ui/ListRow'
import StatusPill from '@/components/ui/StatusPill'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useWeekDetail, type AssignmentSummary, type LessonSummary } from '@/hooks/useWeekDetail'

const ASSIGNMENT_STATUS: Record<string, string> = {
  passed: 'PASSED',
  needs_work: 'NEEDS WORK',
  pending: 'AWAITING FEEDBACK',
}

function LessonRow({ weekId, lesson, isCurrent }: { weekId: string; lesson: LessonSummary; isCurrent: boolean }) {
  const duration = lesson.estimated_minutes
    ? `${lesson.estimated_minutes} MIN`
    : lesson.requiredTotal > 0
      ? `${lesson.requiredChecked}/${lesson.requiredTotal}`
      : ''

  const state = lesson.completed || isCurrent ? 'active' : 'default'

  return (
    <Link to={`/weeks/${weekId}/lessons/${lesson.id}`} className="block no-underline">
      <ListRow state={state}>
        <div className="min-w-0">
          <RowMeta className="mt-0 mb-1.5 font-mono uppercase">Lesson {String(lesson.position).padStart(2, '0')}</RowMeta>
          <RowTitle>{lesson.title}</RowTitle>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {lesson.completed && (
            <StatusPill variant="pass" tone="cream">
              done
            </StatusPill>
          )}
          {!lesson.completed && isCurrent && (
            <StatusPill variant="progress" tone="cream">
              current
            </StatusPill>
          )}
          {duration && <RowMeta className="m-0 whitespace-nowrap font-mono normal-case">{duration}</RowMeta>}
        </div>
      </ListRow>
    </Link>
  )
}

function AssignmentSidebarCard({ weekId, assignment }: { weekId: string; assignment: AssignmentSummary }) {
  const status = assignment.latestStatus ? ASSIGNMENT_STATUS[assignment.latestStatus] : 'NOT SUBMITTED'
  return (
    <div className="rounded-panel border border-accent-dim p-6.5">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">This week's assignment</p>
      <p className="mb-3 font-display text-xl uppercase leading-[1.15] text-display">{assignment.title}</p>
      <p className="mb-5 text-[13px] leading-[1.6] text-body">Graded the moment you submit. Escalate to your mentor any time.</p>
      <div className="mb-5.5 space-y-2 font-mono text-[11px] text-muted">
        <div>STATUS · {status}</div>
        <div>FORMAT · {assignment.assignment_type.toUpperCase()}</div>
      </div>
      <LinkButton to={`/weeks/${weekId}/assignments/${assignment.id}`} variant="cta" className="w-full">
        Open assignment
      </LinkButton>
    </div>
  )
}

export default function WeekPage() {
  const { weekId } = useParams()
  const { hash } = useLocation()
  const { week, lessons, assignments, loading, error } = useWeekDetail(weekId)

  useEffect(() => {
    if (!hash || loading) return
    const el = document.getElementById(hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash, loading])

  if (loading) return <FullPageSpinner />

  const currentLessonId = lessons.find((l) => !l.completed)?.id
  const doneLessons = lessons.filter((l) => l.completed).length
  const weekPercent = lessons.length > 0 ? Math.round((doneLessons / lessons.length) * 100) : 0
  const [primaryAssignment, ...extraAssignments] = assignments

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      {week && <Breadcrumb items={[{ label: 'dashboard', to: '/dashboard' }, { label: `week ${week.position}` }]} />}

      <main className="mx-auto max-w-[1160px] px-6 py-9">
        {error && <p className="text-sm font-bold text-danger-text">Couldn't load this week: {error}</p>}

        {week && (
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-[2_1_460px] space-y-5">
              <div className="rounded-shell border border-hairline p-9">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                  Week {String(week.position).padStart(2, '0')}
                  {weekPercent >= 100 ? ' · complete' : ' · in progress'}
                </p>
                <h1 className="mb-4.5 font-display text-[clamp(26px,3.4vw,38px)] uppercase leading-[1.05] text-display">
                  {week.title}
                </h1>
                {week.goal && <p className="mb-6 max-w-[56ch] text-[15px] leading-[1.75] text-body">{week.goal}</p>}
                <div className="flex items-center gap-3.5">
                  <div className="progress-track max-w-[260px] flex-1">
                    <div className="progress-fill" style={{ width: `${weekPercent}%` }} />
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-muted">
                    {doneLessons} of {lessons.length} lessons
                  </span>
                </div>
              </div>

              <div className="rounded-shell border border-hairline p-8">
                <h2 className="mb-5 text-lg font-bold text-heading">Lessons</h2>
                <div className="space-y-2.5">
                  {lessons.map((lesson) => (
                    <LessonRow key={lesson.id} weekId={week.id} lesson={lesson} isCurrent={lesson.id === currentLessonId} />
                  ))}
                  {lessons.length === 0 && <p className="text-sm text-muted">No lessons yet.</p>}
                </div>
              </div>

              {extraAssignments.length > 0 && (
                <div className="rounded-shell border border-hairline p-8">
                  <h2 className="mb-5 text-lg font-bold text-heading">More assignments</h2>
                  <div className="space-y-2.5">
                    {extraAssignments.map((a) => (
                      <Link key={a.id} to={`/weeks/${week.id}/assignments/${a.id}`} className="block no-underline">
                        <ListRow state="default">
                          <RowTitle>{a.title}</RowTitle>
                          <RowMeta className="m-0 uppercase">{a.assignment_type}</RowMeta>
                        </ListRow>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="min-w-[250px] flex-[1_1_260px]">
              <div className="sticky top-5">{primaryAssignment && <AssignmentSidebarCard weekId={week.id} assignment={primaryAssignment} />}</div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
