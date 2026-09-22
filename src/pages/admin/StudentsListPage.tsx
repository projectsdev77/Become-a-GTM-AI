import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import ListRow, { RowTitle, RowMeta } from '@/components/ui/ListRow'
import { Field } from '@/components/ui/Field'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { friendlyDbError } from '@/lib/friendlyDbError'
import type { Profile } from '@/types/database'

interface StudentRow extends Profile {
  mentorName: string | null
  email: string | null
}

function useStudents() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [emailError, setEmailError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false })

      const studentIds = (profiles ?? []).map((p) => p.id)
      const [{ data: assignments }, { data: emailRows, error: emailRpcError }] = await Promise.all([
        studentIds.length
          ? supabase.from('mentor_assignments').select('student_id, mentor_id').in('student_id', studentIds).eq('is_active', true)
          : Promise.resolve({ data: [] }),
        // profiles has no email column — it lives in auth.users, which
        // this RPC is the only way to reach from the client.
        supabase.rpc('admin_list_student_emails'),
      ])
      if (emailRpcError) {
        console.error('admin_list_student_emails failed', emailRpcError)
        setEmailError(
          friendlyDbError(emailRpcError, "Couldn't load student emails — search by email won't work until this is fixed."),
        )
      }

      const mentorIds = [...new Set((assignments ?? []).map((a) => a.mentor_id))]
      const { data: mentors } = mentorIds.length
        ? await supabase.from('profiles').select('id, full_name').in('id', mentorIds)
        : { data: [] }

      const mentorNameById = new Map((mentors ?? []).map((m) => [m.id, m.full_name]))
      const mentorIdByStudent = new Map((assignments ?? []).map((a) => [a.student_id, a.mentor_id]))
      const emails = (emailRows ?? []) as { id: string; email: string }[]
      const emailById = new Map(emails.map((r) => [r.id, r.email]))

      setStudents(
        ((profiles ?? []) as Profile[]).map((p) => ({
          ...p,
          mentorName: mentorNameById.get(mentorIdByStudent.get(p.id) ?? '') ?? null,
          email: emailById.get(p.id) ?? null,
        })),
      )
      setLoading(false)
    })()
  }, [])

  return { students, loading, emailError }
}

export default function StudentsListPage() {
  const { students, loading, emailError } = useStudents()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) =>
        (s.full_name ?? '').toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q) ||
        (s.mentorName ?? '').toLowerCase().includes(q),
    )
  }, [students, query])

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-[clamp(28px,5.2vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          {students.length} students
        </h1>

        {emailError && <p className="mt-4 text-sm font-bold text-danger-text">{emailError}</p>}

        <Field
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="mt-6 max-w-[360px]"
        />

        <div className="mt-6 flex flex-col gap-[clamp(12px,1.6vw,18px)]">
          {filtered.map((s) => (
            <Link key={s.id} to={`/admin/students/${s.id}`} className="block no-underline">
              <ListRow state={s.payment_status === 'paid' ? 'active' : 'pending'}>
                <div className="min-w-0 flex-1 basis-[240px]">
                  <RowTitle>{s.full_name ?? 'Unnamed student'}</RowTitle>
                  <RowMeta>
                    {s.email ? `${s.email} · ` : ''}
                    {s.mentorName ? `mentor ${s.mentorName}` : 'no mentor assigned'}
                  </RowMeta>
                </div>
                {s.payment_status === 'paid' ? (
                  <span className="badge badge-pass shrink-0">Paid</span>
                ) : (
                  <span className="badge badge-pending shrink-0">Unpaid</span>
                )}
              </ListRow>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && <p className="py-8 text-center font-mono text-xs font-bold uppercase text-muted">No students found.</p>}
      </main>
    </div>
  )
}
