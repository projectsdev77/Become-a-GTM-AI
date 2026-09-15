import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import StatusPill, { type StatusVariant } from '@/components/ui/StatusPill'
import MessageThread from '@/components/messages/MessageThread'
import { ChevronRightIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import { useWeeklyHours } from '@/hooks/useWeeklyHours'
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

  if (progressLoading) return <FullPageSpinner />

  const overall = data?.overall
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <Breadcrumb
        items={[{ label: 'your students', to: '/mentor' }, { label: studentProfile?.full_name?.toLowerCase() ?? 'student' }]}
      />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        {error && <p className="mb-4 text-sm font-bold text-fail-text">{error}</p>}

        <div className="flex flex-wrap gap-5">
          <div className="min-w-0 flex-[2_1_440px]">
            <div className="mb-4 rounded-panel border border-line p-7">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <Avatar name={studentProfile?.full_name} size={52} />
                <div>
                  <p className="font-display text-[22px] uppercase leading-tight text-text">
                    {studentProfile?.full_name ?? 'Student'}
                  </p>
                  {studentProfile?.background && (
                    <p className="mt-1 max-w-md text-[13.5px] text-text-muted">{studentProfile.background}</p>
                  )}
                </div>
              </div>

              <ProgressBar percent={overallPercent} className="mb-4" />

              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
                <div className="rounded-card bg-card-light px-[18px] py-4">
                  <p className="font-display text-2xl text-on-light">{overallPercent}%</p>
                  <p className="mt-1 font-mono text-[10.5px] text-on-light-meta">PROGRESS</p>
                </div>
                <div className="rounded-card border border-line px-[18px] py-4">
                  <p className="font-display text-2xl text-text">{submissions.length}</p>
                  <p className="mt-1 font-mono text-[10.5px] text-text-muted">SUBMISSIONS</p>
                </div>
                <div className="rounded-card border border-line px-[18px] py-4">
                  <p className="font-display text-2xl text-text">
                    {studentProfile?.weekly_hours_target != null ? `${studentProfile.weekly_hours_target}h` : '—'}
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] text-text-muted">
                    WEEKLY TARGET
                    {weeklyHours && ` · ${(weeklyHours.logged_minutes / 60).toFixed(1)}H LOGGED`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-panel border border-line p-7">
              <p className="mb-4 text-base font-bold text-text-bright">Recent submissions</p>
              <div className="flex flex-col gap-2.5">
                {submissionsLoading && <p className="font-mono text-xs font-bold uppercase text-text-muted">loading…</p>}
                {!submissionsLoading && submissions.length === 0 && (
                  <p className="text-[14.5px] text-text-muted">No submissions yet.</p>
                )}
                {submissions.map((s, i) => (
                  <div
                    key={s.id}
                    className={`flex flex-wrap items-center justify-between gap-3.5 rounded-card px-[18px] py-[15px] ${
                      i === 0 ? 'bg-card-light' : 'border border-line'
                    }`}
                  >
                    <div>
                      <p className={`font-mono text-[10.5px] ${i === 0 ? 'text-on-light-meta' : 'text-text-muted'}`}>
                        {new Date(s.submitted_at).toLocaleDateString()} · attempt {s.attempt_number}
                      </p>
                      <p className={`text-sm font-bold ${i === 0 ? 'text-on-light' : 'text-text-bright'}`}>
                        {s.assignmentTitle}
                      </p>
                    </div>
                    <StatusPill variant={STATUS_VARIANT[s.final_status]}>{STATUS_LABEL[s.final_status]}</StatusPill>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="min-w-[260px] flex-[1_1_280px]">
            <div className="rounded-panel border border-line p-6">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-text-muted">Thread</p>
              {studentId && <MessageThread studentId={studentId} />}
            </div>
          </div>
        </div>

        <Link
          to="/mentor"
          className="mt-8 inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wide text-primary"
        >
          <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" /> back to your students
        </Link>
      </main>
    </div>
  )
}
