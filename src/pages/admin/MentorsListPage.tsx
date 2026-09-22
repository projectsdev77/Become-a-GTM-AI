import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import ListRow, { RowTitle, RowMeta } from '@/components/ui/ListRow'
import { Field, Label } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import Callout from '@/components/ui/Callout'
import Avatar from '@/components/ui/Avatar'
import { AlertIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { functionErrorMessage } from '@/lib/functionsError'
import { friendlyDbError } from '@/lib/friendlyDbError'
import type { Profile } from '@/types/database'

interface MentorRow extends Profile {
  activeStudentCount: number
  pending: boolean
}

function useMentors() {
  const [mentors, setMentors] = useState<MentorRow[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    // Deliberately not setLoading(true) here: it's also called right after
    // a successful invite, and flipping loading back to true would
    // unmount the whole page back to a full-page spinner right then.
    // status = 'suspended' is a removed mentor (admin_remove_mentor) — drop
    // them from the roster rather than showing a dead entry with nothing
    // left to do on it.
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'mentor')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    const mentorIds = (profiles ?? []).map((p) => p.id)
    const { data: assignments } = mentorIds.length
      ? await supabase.from('mentor_assignments').select('mentor_id').in('mentor_id', mentorIds).eq('is_active', true)
      : { data: [] }

    const countByMentor = new Map<string, number>()
    for (const a of assignments ?? []) {
      countByMentor.set(a.mentor_id, (countByMentor.get(a.mentor_id) ?? 0) + 1)
    }

    // profiles has no visibility into auth.users, so whether an invite has
    // actually been accepted (as opposed to just sent — admin-invite-mentor
    // creates the profile row immediately) has to come from a separate
    // admin-only call. Don't let this fail the whole page: an invite still
    // shows up, just without the pending badge, if it errors.
    const { data: statusData } = await supabase.functions.invoke('admin-mentor-status')
    const pendingIds = new Set<string>(statusData?.pending ?? [])

    setMentors(
      ((profiles ?? []) as Profile[]).map((p) => ({
        ...p,
        activeStudentCount: countByMentor.get(p.id) ?? 0,
        pending: pendingIds.has(p.id),
      })),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { mentors, loading, refresh }
}

function AddMentorForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error: invokeError } = await supabase.functions.invoke('admin-invite-mentor', {
      body: { email, fullName },
    })
    setSubmitting(false)
    if (invokeError) {
      setError(await functionErrorMessage(invokeError))
      return
    }
    if (data?.error) {
      setError(data.error as string)
      return
    }
    setSent(true)
    setFullName('')
    setEmail('')
    onAdded()
  }

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        Invite mentor
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-panel border border-accent-dim p-7">
      <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Invite a mentor</p>
      <p className="mb-4.5 max-w-[52ch] text-[13.5px] leading-relaxed text-body">
        They&apos;ll get an email with a signup link.
      </p>
      <div className="flex flex-wrap gap-3">
        <div className="min-w-[220px] flex-1">
          <Label htmlFor="mentor_full_name">Full name</Label>
          <Field id="mentor_full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="min-w-[220px] flex-1">
          <Label htmlFor="mentor_email">Email</Label>
          <Field id="mentor_email" type="email" required placeholder="mentor@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      {error && (
        <Callout tone="fail" heading="Couldn't send invite" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mt-4">
          {error}
        </Callout>
      )}
      {sent && (
        <Callout tone="pass" className="mt-4">
          Invite sent — they&apos;ll set their own password from the email link.
        </Callout>
      )}

      <div className="mt-4 flex gap-3">
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send invite'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function MentorRow({ mentor, onRemoved }: { mentor: MentorRow; onRemoved: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove() {
    setRemoving(true)
    setError(null)
    const { error } = await supabase.rpc('admin_remove_mentor', { p_mentor_id: mentor.id })
    setRemoving(false)
    if (error) {
      setError(friendlyDbError(error, "Couldn't remove this mentor."))
      return
    }
    onRemoved()
  }

  return (
    <div>
      <ListRow state={mentor.pending ? 'pending' : 'active'}>
        <div className="flex min-w-0 flex-1 basis-[240px] items-center gap-3.5">
          <Avatar name={mentor.full_name} size={38} />
          <div className="min-w-0">
            <RowTitle>{mentor.full_name ?? 'Unnamed mentor'}</RowTitle>
            <RowMeta>{mentor.pending ? 'Invited · awaiting acceptance' : `${mentor.activeStudentCount} students`}</RowMeta>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {mentor.pending ? (
            <span className="badge badge-pending">Pending invite</span>
          ) : (
            <span className="badge badge-pass">Active</span>
          )}
          {!confirming ? (
            <Button type="button" variant="secondary" size="sm" danger onClick={() => setConfirming(true)}>
              Remove
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" danger onClick={() => void handleRemove()} disabled={removing}>
                {removing ? 'Removing…' : 'Confirm'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </ListRow>
      {error && <p className="mt-1.5 text-[12.5px] font-bold text-danger-text">{error}</p>}
    </div>
  )
}

export default function MentorsListPage() {
  const { mentors, loading, refresh } = useMentors()

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <h1 className="mb-6 font-display text-[clamp(28px,5.2vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          Mentor roster
        </h1>

        <div className="mb-5">
          <AddMentorForm onAdded={refresh} />
        </div>

        <div className="flex flex-col gap-[clamp(12px,1.6vw,18px)]">
          {mentors.map((m) => (
            <MentorRow key={m.id} mentor={m} onRemoved={refresh} />
          ))}
        </div>
        {mentors.length === 0 && <p className="py-8 text-center font-mono text-xs font-bold uppercase text-muted">No mentors yet.</p>}
      </main>
    </div>
  )
}
