import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import AppNav from '@/components/layout/AppNav'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useMentorStudents } from '@/hooks/useMentorStudents'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import { MESSAGES_READ_EVENT } from '@/hooks/useUnreadMessages'
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table'
import Avatar from '@/components/ui/Avatar'
import { ChevronRightIcon } from '@/components/ui/icons'

function timeAgo(iso: string | null): string {
  if (!iso) return 'never active'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'active today'
  if (days === 1) return 'active yesterday'
  return `active ${days} days ago`
}

/** Unread message count per assigned student — which one to check, not just that one did. */
function useUnreadByStudent() {
  const { user } = useAuth()
  const [counts, setCounts] = useState<Map<string, number>>(new Map())

  const refresh = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('messages').select('student_id').neq('sender_id', user.id).is('read_at', null)
    const map = new Map<string, number>()
    for (const row of data ?? []) {
      map.set(row.student_id, (map.get(row.student_id) ?? 0) + 1)
    }
    setCounts(map)
  }, [user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Catches reading a student's thread without leaving this page mounted
  // (e.g. a future embedded thread view) — clears the badge right away
  // instead of only on the next navigation back to this page.
  useEffect(() => {
    const handler = () => void refresh()
    window.addEventListener(MESSAGES_READ_EVENT, handler)
    return () => window.removeEventListener(MESSAGES_READ_EVENT, handler)
  }, [refresh])

  return counts
}

export default function MentorDashboardPage() {
  const { students, loading, error } = useMentorStudents()
  const { open: openQueueItems } = useExceptionQueue()
  const unreadByStudent = useUnreadByStudent()

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <h1 className="font-display text-[clamp(24px,3.2vw,34px)] uppercase text-text">Your students</h1>
          <nav className="flex flex-wrap gap-2.5">
            <span className="rounded-pill bg-card-light px-[18px] py-2 text-[13px] font-bold text-on-light">
              Your students
            </span>
            <Link
              to="/mentor/queue"
              className="flex items-center gap-2 rounded-pill border border-line px-[18px] py-2 text-[13px] font-medium text-text-body no-underline hover:border-line-strong"
            >
              Queue
              {openQueueItems.length > 0 && <span className="pill pill-warn">{openQueueItems.length}</span>}
            </Link>
          </nav>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-fail-text">{error}</p>}

        <Table>
          <THead>
            <TR>
              <TH>Student</TH>
              <TH>Last active</TH>
              <TH>Messages</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {students.map((student) => (
              <TR key={student.id}>
                <TD>
                  <span className="flex items-center gap-3">
                    <Avatar name={student.full_name} size={32} />
                    <span className="font-semibold text-text-bright">{student.full_name ?? 'Unnamed student'}</span>
                  </span>
                </TD>
                <TD className="font-mono text-[12px]">{timeAgo(student.last_active_at)}</TD>
                <TD>
                  {(unreadByStudent.get(student.id) ?? 0) > 0 ? (
                    <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-primary px-2 font-mono text-[11px] font-bold leading-none text-white">
                      {unreadByStudent.get(student.id)}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-text-muted">—</span>
                  )}
                </TD>
                <TD className="text-right">
                  <Link
                    to={`/mentor/students/${student.id}`}
                    className="inline-flex items-center gap-1 font-mono text-[11.5px] font-bold uppercase text-primary no-underline hover:underline"
                  >
                    view <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
        {students.length === 0 && (
          <p className="py-8 text-center font-mono text-xs font-bold uppercase text-text-muted">No students assigned yet.</p>
        )}
      </main>
    </div>
  )
}
