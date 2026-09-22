import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import AppNav from '@/components/layout/AppNav'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useMentorStudents } from '@/hooks/useMentorStudents'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import { MESSAGES_READ_EVENT } from '@/hooks/useUnreadMessages'
import ListRow, { RowTitle, RowMeta } from '@/components/ui/ListRow'
import Avatar from '@/components/ui/Avatar'

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
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
          <h1 className="font-display text-[clamp(28px,5.6vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
            Your students
          </h1>
          <nav className="flex flex-wrap gap-2.5">
            <span className="flex min-h-11 items-center whitespace-nowrap rounded-pill bg-cream px-[18px] py-2 text-[13px] font-bold text-ink-on-cream">
              Your students
            </span>
            <Link
              to="/mentor/queue"
              className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-pill border border-border-secondary px-[18px] py-2 text-[13px] font-medium text-body no-underline hover:border-muted"
            >
              Queue
              {openQueueItems.length > 0 && <span className="badge badge-accent">{openQueueItems.length}</span>}
            </Link>
          </nav>
        </div>

        {error && <p className="mb-4 text-sm font-bold text-danger-text">{error}</p>}

        <div className="flex flex-col gap-[clamp(12px,1.6vw,18px)]">
          {students.map((student) => {
            const unread = unreadByStudent.get(student.id) ?? 0
            return (
              <Link key={student.id} to={`/mentor/students/${student.id}`} className="block no-underline">
                <ListRow state={unread > 0 ? 'active' : 'default'}>
                  <div className="flex min-w-0 flex-1 basis-[240px] items-center gap-3.5">
                    <Avatar name={student.full_name} size={38} />
                    <div className="min-w-0">
                      <RowTitle>{student.full_name ?? 'Unnamed student'}</RowTitle>
                      <RowMeta>{timeAgo(student.last_active_at)}</RowMeta>
                    </div>
                  </div>
                  {unread > 0 ? (
                    <span className="badge badge-alert shrink-0">{unread} unread</span>
                  ) : (
                    <span className="shrink-0 whitespace-nowrap text-[12.5px] font-semibold text-muted">On track</span>
                  )}
                </ListRow>
              </Link>
            )
          })}
        </div>
        {students.length === 0 && (
          <p className="py-8 text-center font-mono text-xs font-bold uppercase text-muted">No students assigned yet.</p>
        )}
      </main>
    </div>
  )
}
