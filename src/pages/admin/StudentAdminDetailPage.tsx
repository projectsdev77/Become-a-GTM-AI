import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { friendlyDbError } from '@/lib/friendlyDbError'
import { useAuth } from '@/context/AuthContext'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ProgressBar from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { Field, Label, SelectField } from '@/components/ui/Field'
import StatusPill from '@/components/ui/StatusPill'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { functionErrorMessage } from '@/lib/functionsError'
import { useProgressOverview } from '@/hooks/useProgressOverview'
import type { Profile } from '@/types/database'

function useMentorOptions() {
  const [mentors, setMentors] = useState<Profile[]>([])
  useEffect(() => {
    ;(async () => {
      // status = 'active' excludes a removed mentor (admin_remove_mentor) —
      // otherwise this dropdown would let an admin reassign a student to
      // someone who's already been taken off the roster.
      const { data } = await supabase.from('profiles').select('*').eq('role', 'mentor').eq('status', 'active')
      setMentors((data ?? []) as Profile[])
    })()
  }, [])
  return mentors
}

function useStudentAccount(studentId: string | undefined) {
  const [account, setAccount] = useState<{ full_name: string | null; status: Profile['status'] } | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!studentId) return
    setLoading(true)
    const { data } = await supabase.from('profiles').select('full_name, status').eq('id', studentId).single()
    setAccount(data as { full_name: string | null; status: Profile['status'] } | null)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  return { account, loading, refresh }
}

function useCurrentMentor(studentId: string | undefined) {
  const [mentorId, setMentorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!studentId) return
    setLoading(true)
    const { data } = await supabase
      .from('mentor_assignments')
      .select('mentor_id')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .maybeSingle()
    setMentorId(data?.mentor_id ?? null)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  return { mentorId, loading, refresh }
}

export default function StudentAdminDetailPage() {
  const { studentId } = useParams()
  const { user } = useAuth()
  const { data, loading: progressLoading, error, refresh: refreshProgress } = useProgressOverview(studentId)
  const mentors = useMentorOptions()
  const { mentorId, refresh: refreshMentor } = useCurrentMentor(studentId)
  const [reassigning, setReassigning] = useState(false)
  const { account, refresh: refreshAccount } = useStudentAccount(studentId)
  const [confirmingStatus, setConfirmingStatus] = useState(false)
  const [settingStatus, setSettingStatus] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [unlockWeekId, setUnlockWeekId] = useState('')
  const [unlockReason, setUnlockReason] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const [paymentNote, setPaymentNote] = useState('')
  const [settingPayment, setSettingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  async function setPaymentStatus(status: 'paid' | 'unpaid') {
    if (!studentId) return
    setSettingPayment(true)
    setPaymentError(null)
    const { error } = await supabase.rpc('admin_set_payment_status', {
      p_student_id: studentId,
      p_status: status,
      p_note: paymentNote.trim() || null,
    })
    setSettingPayment(false)
    if (error) {
      setPaymentError(friendlyDbError(error, "Couldn't update the payment status."))
      return
    }
    setPaymentNote('')
    await refreshProgress()
  }

  async function reassignMentor(newMentorId: string) {
    if (!studentId) return
    setReassigning(true)
    const { error } = await supabase.rpc('admin_reassign_mentor', {
      p_student_id: studentId,
      p_mentor_id: newMentorId,
    })
    setReassigning(false)
    if (!error) await refreshMentor()
  }

  async function setAccountStatus(status: 'active' | 'suspended') {
    if (!studentId) return
    setSettingStatus(true)
    setStatusError(null)
    const { data, error: invokeError } = await supabase.functions.invoke('admin-set-student-status', {
      body: { studentId, status },
    })
    setSettingStatus(false)
    if (invokeError) {
      setStatusError(await functionErrorMessage(invokeError))
      return
    }
    if (data?.error) {
      setStatusError(data.error as string)
      return
    }
    setConfirmingStatus(false)
    await refreshAccount()
  }

  async function manualUnlock() {
    if (!studentId || !user || !unlockWeekId || !unlockReason.trim()) return
    setUnlocking(true)
    setUnlockError(null)
    const { error } = await supabase.from('week_unlocks').insert({
      user_id: studentId,
      week_id: unlockWeekId,
      unlocked_by: 'admin',
      unlocked_by_user_id: user.id,
      reason: unlockReason.trim(),
    })
    setUnlocking(false)
    if (error) {
      // 23505 = unique_violation on week_unlocks(user_id, week_id) — the
      // week list below is only as fresh as the last refreshProgress(),
      // so this can still happen (two rapid clicks, a second admin tab,
      // the system's own auto-unlock landing in between). Either way the
      // week ends up unlocked, so treat it like success once refreshed.
      if (error.code === '23505') {
        setUnlockError(null)
        setUnlockWeekId('')
        setUnlockReason('')
      } else {
        setUnlockError(friendlyDbError(error, "Couldn't unlock that week."))
      }
      await refreshProgress()
      return
    }
    setUnlockWeekId('')
    setUnlockReason('')
    await refreshProgress()
  }

  if (progressLoading) return <FullPageSpinner />

  const overall = data?.overall
  const overallPercent =
    overall && overall.resources_total > 0
      ? Math.round((overall.resources_completed / overall.resources_total) * 100)
      : 0
  const lockedWeeks = (data?.weeks ?? []).filter((w) => !w.unlocked)

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <Breadcrumb items={[{ label: 'students', to: '/admin/students' }, { label: account?.full_name?.toLowerCase() ?? 'student' }]} />
        <h1 className="mb-6 mt-2 font-display text-[clamp(26px,4.4vw,38px)] uppercase leading-[0.96] tracking-[-0.02em] text-display">
          {account?.full_name ?? 'Student'}
        </h1>
        {error && <p className="text-sm font-bold text-danger-text">{error}</p>}

        <div className="grid gap-5 lg:grid-cols-2">
          {overall && (
            <div className="rounded-panel border border-hairline p-6">
              <div className="flex items-center justify-between">
                <span className="meta">Overall progress</span>
                <span className="font-display text-2xl text-display">{overallPercent}%</span>
              </div>
              <div className="mt-3">
                <ProgressBar percent={overallPercent} />
              </div>
            </div>
          )}

          <div className="rounded-panel border border-hairline p-6">
            <span className="meta">Assigned mentor</span>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              Reassigning moves the message thread and the exception queue with the student.
            </p>
            <div className="mt-3">
              <Label htmlFor="mentor">Reassign</Label>
              <SelectField id="mentor" value={mentorId ?? ''} disabled={reassigning} onChange={(e) => void reassignMentor(e.target.value)}>
                <option value="" disabled>
                  Select a mentor…
                </option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? m.id}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <div className="rounded-panel border border-hairline p-6">
            <div className="flex items-center justify-between">
              <span className="meta">Payment</span>
              {data?.payment_status === 'paid' ? (
                <StatusPill variant="pass">paid</StatusPill>
              ) : (
                <StatusPill variant="progress">unpaid</StatusPill>
              )}
            </div>
            <p className="mt-2 text-[13.5px] text-muted">
              Week 1 is free for everyone; the rest of the program requires payment. Stripe isn&apos;t wired up yet —
              mark paid manually once payment is confirmed some other way.
            </p>
            <div className="mt-4 space-y-3">
              <Field
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Note (e.g. paid via bank transfer, ref #1234)…"
              />
              {paymentError && <p className="text-sm font-bold text-danger-text">{paymentError}</p>}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => void setPaymentStatus('paid')}
                  disabled={settingPayment || data?.payment_status === 'paid'}
                >
                  {settingPayment ? 'Saving…' : 'Mark as paid'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void setPaymentStatus('unpaid')}
                  disabled={settingPayment || data?.payment_status !== 'paid'}
                >
                  Mark as unpaid
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-panel border border-hairline p-6">
            <div className="flex items-center justify-between">
              <span className="meta">Account</span>
              {account?.status === 'suspended' ? (
                <StatusPill variant="locked">suspended</StatusPill>
              ) : (
                <StatusPill variant="pass">active</StatusPill>
              )}
            </div>
            <p className="mt-2 text-[13.5px] text-muted">
              {account?.status === 'suspended'
                ? "This student can't sign in until reactivated. Their progress and submissions are untouched."
                : "Suspending blocks sign-in immediately. Their progress and submissions stay intact and nothing is deleted."}
            </p>
            {statusError && <p className="mt-3 text-sm font-bold text-danger-text">{statusError}</p>}
            <div className="mt-4">
              {!confirmingStatus ? (
                <Button
                  type="button"
                  variant={account?.status === 'suspended' ? 'primary' : 'secondary'}
                  danger={account?.status !== 'suspended'}
                  onClick={() => setConfirmingStatus(true)}
                >
                  {account?.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}
                </Button>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant={account?.status === 'suspended' ? 'primary' : 'secondary'}
                    danger={account?.status !== 'suspended'}
                    onClick={() => void setAccountStatus(account?.status === 'suspended' ? 'active' : 'suspended')}
                    disabled={settingStatus}
                  >
                    {settingStatus ? 'Saving…' : `Confirm ${account?.status === 'suspended' ? 'reactivate' : 'suspend'}`}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setConfirmingStatus(false)} disabled={settingStatus}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-panel border border-accent-dim p-6">
          <p className="meta">Manually unlock a week</p>
          <p className="mt-1.5 max-w-[56ch] text-[13.5px] text-muted">
            Overrides the payment gate for a single week. Use for comped access and support cases — it&apos;s logged
            against your account.
          </p>
          <div className="mt-4 space-y-3">
            <SelectField value={unlockWeekId} onChange={(e) => setUnlockWeekId(e.target.value)}>
              <option value="">Select a locked week…</option>
              {lockedWeeks.map((w) => (
                <option key={w.week_id} value={w.week_id}>
                  Week {w.position}: {w.title}
                </option>
              ))}
            </SelectField>
            <Field value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} placeholder="Reason (required)…" />
            {unlockError && <p className="text-sm font-bold text-danger-text">{unlockError}</p>}
            <Button type="button" variant="primary" onClick={() => void manualUnlock()} disabled={unlocking || !unlockWeekId || !unlockReason.trim()}>
              {unlocking ? 'Unlocking…' : 'Unlock'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
