import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import ListRow, { RowMeta } from '@/components/ui/ListRow'
import StatusPill, { type StatusVariant } from '@/components/ui/StatusPill'
import { LinkButton } from '@/components/ui/Button'
import MessageThread from '@/components/messages/MessageThread'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import { useWeeklyHours } from '@/hooks/useWeeklyHours'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import type { Submission } from '@/types/database'

interface StudentProfile {
  full_name: string | null
  background: string | null
  weekly_hours_target: number | null
}

function useStudentProfile(studentId: string | undefined) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)

  useEffect(() => {
    if (!studentId) return
    let active = true
    void supabase
      .from('profiles')
      .select('full_name, background, weekly_hours_target')
      .eq('id', studentId)
      .single()
      .then(({ data }) => {
        if (active) setProfile(data as StudentProfile | null)
      })
    return () => {
      active = false
    }
  }, [studentId])

  return profile
}

interface RecentSubmission extends Submission {
  assignmentTitle: string
}

function useRecentSubmissions(studentId: string | undefined) {
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    let active = true
    setLoading(true)
    ;(async () => {
      const { data: subs } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', studentId)
        .order('submitted_at', { ascending: false })
        .limit(10)
      const assignmentIds = [...new Set((subs ?? []).map((s) => s.assignment_id))]
      const { data: assignments } = assignmentIds.length
        ? await supabase.from('assignments').select('id, title').in('id', assignmentIds)
        : { data: [] }
      const titleById = new Map((assignments ?? []).map((a) => [a.id, a.title]))
      if (active) {
        setSubmissions(
          ((subs ?? []) as Submission[]).map((s) => ({
            ...s,
            assignmentTitle: titleById.get(s.assignment_id) ?? 'Unknown assignment',
          })),
        )
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [studentId])

  return { submissions, loading }
}

const STATUS_VARIANT: Record<string, StatusVariant> = {
  passed: 'pass',
  needs_work: 'warn',
  pending: 'progress',
}
const STATUS_LABEL: Record<string, string> = { passed: 'passed', needs_work: 'needs work', pending: 'pending' }

export default function StudentDetailPage() {
  const { studentId } = useParams()
  const { data, loading: progressLoading, error } = useProgressOverview(studentId)
  const { submissions, loading: submissionsLoading } = useRecentSubmissions(studentId)
  const { data: weeklyHours } = useWeeklyHours(studentId)
  const studentProfile = useStudentProfile(studentId)
  const { open: openQueueItems } = useExceptionQueue()
  const openForStudent = openQueueItems.filter((i) => i.user_id === studentId)

  if (progressLoading) return <FullPageSpinner />

  const overall = data?.overall
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <Breadcrumb
          items={[{ label: 'your students', to: '/mentor' }, { label: studentProfile?.full_name?.toLowerCase() ?? 'student' }]}
        />

        {error && <p className="mb-4 text-sm font-bold text-danger-text">{error}</p>}

        <div className="mb-[clamp(26px,3.4vw,38px)] flex flex-wrap items-center justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[18px]">
            <Avatar name={studentProfile?.full_name} size={64} />
            <div className="min-w-0">
              <h1 className="truncate font-display text-[clamp(26px,4.4vw,40px)] uppercase leading-[0.96] tracking-[-0.02em] text-display">
                {studentProfile?.full_name ?? 'Student'}
              </h1>
              {studentProfile?.background && (
                <p className="mt-1 max-w-md text-[13.5px] text-muted">{studentProfile.background}</p>
              )}
            </div>
          </div>
          {openForStudent.length > 0 && (
            <LinkButton to="/mentor/queue" variant="cta" className="shrink-0">
              Review {openForStudent.length} in queue
            </LinkButton>
          )}
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="min-w-0 flex-[2_1_440px]">
            <div className="mb-4 flex flex-wrap items-center gap-[clamp(24px,4vw,56px)] rounded-panel border border-hairline p-7">
              <div className="min-w-0 flex-1 basis-[240px]">
                <p className="mb-3 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Progress</p>
                <div className="mb-3 flex items-baseline gap-2.5">
                  <span className="font-display text-[30px] text-display">{overallPercent}%</span>
                </div>
                <ProgressBar percent={overallPercent} className="max-w-[320px]" />
              </div>
              <div className="flex shrink-0 flex-wrap gap-[clamp(20px,4vw,44px)]">
                <div>
                  <p className="font-display text-2xl text-display">{submissions.length}</p>
                  <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Submissions</p>
                </div>
                <div>
                  <p className="font-display text-2xl text-display">
                    {studentProfile?.weekly_hours_target != null ? `${studentProfile.weekly_hours_target}h` : '—'}
                  </p>
                  <p className="mt-1 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">
                    Weekly target
                    {weeklyHours && ` · ${(weeklyHours.logged_minutes / 60).toFixed(1)}h logged`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-panel border border-hairline p-7">
              <h2 className="mb-5 text-[19px] font-bold text-heading">Recent submissions</h2>
              <div className="flex flex-col gap-[clamp(12px,1.6vw,18px)]">
                {submissionsLoading && <p className="font-mono text-xs font-bold uppercase text-muted">loading…</p>}
                {!submissionsLoading && submissions.length === 0 && (
                  <p className="text-[14.5px] text-muted">No submissions yet.</p>
                )}
                {submissions.map((s, i) => (
                  <ListRow key={s.id} state={i === 0 ? 'active' : 'default'}>
                    <div className="min-w-0 flex-1 basis-[240px]">
                      <RowMeta className="mt-0 mb-1.5">
                        {new Date(s.submitted_at).toLocaleDateString()} · attempt {s.attempt_number}
                      </RowMeta>
                      <p className="text-[16px] font-bold leading-tight">{s.assignmentTitle}</p>
                    </div>
                    <StatusPill variant={STATUS_VARIANT[s.final_status]} tone={i === 0 ? 'cream' : 'dark'}>
                      {STATUS_LABEL[s.final_status]}
                    </StatusPill>
                  </ListRow>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-[260px] flex-[1_1_280px]" id="mentor-thread">
            <div className="rounded-panel border border-hairline p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-muted">Thread</p>
              {studentId && <MessageThread studentId={studentId} />}
            </div>
          </div>
        </div>

        <Link
          to="/mentor"
          className="mt-8 inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wide text-accent"
        >
          ← back to your students
        </Link>
      </main>
    </div>
  )
}
