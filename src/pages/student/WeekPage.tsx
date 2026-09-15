import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { LinkButton } from '@/components/ui/Button'
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

  const badge = lesson.completed ? (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-pass-deep text-xs text-white">
      ✓
    </span>
  ) : isCurrent ? (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ground-ink text-xs text-white">
      ↗
    </span>
  ) : (
    <span className="h-[26px] w-[26px] shrink-0 rounded-full border border-line-strong" />
  )

  const rowCls = lesson.completed
    ? 'bg-card-light text-on-light'
    : isCurrent
      ? 'bg-primary text-white'
      : 'border border-line text-text-body'
  const metaCls = lesson.completed ? 'text-on-light-meta' : isCurrent ? 'text-primary-soft' : 'text-text-muted'
  const titleCls = lesson.completed || isCurrent ? '' : 'text-text-body'

  return (
    <Link to={`/weeks/${weekId}/lessons/${lesson.id}`} className="block no-underline">
      <div className={`flex items-center justify-between gap-3.5 rounded-card px-4.5 py-3.5 ${rowCls}`}>
        <div className="flex min-w-0 items-center gap-3.5">
          {badge}
          <div className="min-w-0">
            <p className={`font-mono text-[10.5px] ${metaCls}`}>LESSON {String(lesson.position).padStart(2, '0')}</p>
            <p className={`truncate font-bold text-[14px] ${titleCls}`}>{lesson.title}</p>
          </div>
        </div>
        {duration && <span className={`shrink-0 whitespace-nowrap font-mono text-[10.5px] ${metaCls}`}>{duration}</span>}
      </div>
    </Link>
  )
}

function AssignmentSidebarCard({ weekId, assignment }: { weekId: string; assignment: AssignmentSummary }) {
  const status = assignment.latestStatus ? ASSIGNMENT_STATUS[assignment.latestStatus] : 'NOT SUBMITTED'
  return (
    <div className="rounded-panel border border-[rgba(238,72,35,.5)] p-6.5">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">This week's assignment</p>
      <p className="mb-3 font-display text-xl uppercase leading-[1.15] text-text">{assignment.title}</p>
      <p className="mb-5 text-[13px] leading-[1.6] text-text-body">Graded by AI on submit. Escalate to your mentor any time.</p>
      <div className="mb-5.5 space-y-2 font-mono text-[11px] text-text-muted">
        <div>STATUS · {status}</div>
        <div>FORMAT · {assignment.assignment_type.toUpperCase()}</div>
      </div>
      <LinkButton to={`/weeks/${weekId}/assignments/${assignment.id}`} variant="primary" className="w-full">
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
        {error && <p className="text-sm font-bold text-fail-text">Couldn't load this week: {error}</p>}

        {week && (
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-[2_1_460px] space-y-5">
              <div className="rounded-shell border border-line p-9">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-text-muted">
                  Week {String(week.position).padStart(2, '0')}
                  {weekPercent >= 100 ? ' · complete' : ' · in progress'}
                </p>
                <h1 className="mb-4.5 font-display text-[clamp(26px,3.4vw,38px)] uppercase leading-[1.05] text-text">
                  {week.title}
                </h1>
                {week.goal && <p className="mb-6 max-w-[56ch] text-[15px] leading-[1.75] text-text-body">{week.goal}</p>}
                <div className="flex items-center gap-3.5">
                  <div className="h-[6px] max-w-[260px] flex-1 overflow-hidden rounded-pill bg-line">
                    <div className="h-full rounded-pill bg-primary" style={{ width: `${weekPercent}%` }} />
                  </div>
                  <span className="whitespace-nowrap font-mono text-[11px] text-text-muted">
                    {doneLessons} of {lessons.length} lessons
                  </span>
                </div>
              </div>

              <div className="rounded-shell border border-line p-8">
                <h2 className="mb-5 text-lg font-bold text-text-bright">Lessons</h2>
                <div className="space-y-2.5">
                  {lessons.map((lesson) => (
                    <LessonRow key={lesson.id} weekId={week.id} lesson={lesson} isCurrent={lesson.id === currentLessonId} />
                  ))}
                  {lessons.length === 0 && <p className="text-sm text-text-muted">No lessons yet.</p>}
                </div>
              </div>

              {extraAssignments.length > 0 && (
                <div className="rounded-shell border border-line p-8">
                  <h2 className="mb-5 text-lg font-bold text-text-bright">More assignments</h2>
                  <div className="space-y-2.5">
                    {extraAssignments.map((a) => (
                      <Link
                        key={a.id}
                        to={`/weeks/${week.id}/assignments/${a.id}`}
                        className="flex items-center justify-between gap-3 rounded-card border border-line px-4.5 py-3.5 text-text-body no-underline"
                      >
                        <span className="font-bold text-text">{a.title}</span>
                        <span className="font-mono text-[10.5px] uppercase text-text-muted">{a.assignment_type}</span>
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
