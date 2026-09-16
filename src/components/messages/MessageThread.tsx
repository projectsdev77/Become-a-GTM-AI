import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useMessageThread } from '@/hooks/useMessageThread'
import { TextAreaField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function MessageThread({ studentId }: { studentId: string }) {
  const { user, profile } = useAuth()
  const { messages, loading, sending, error, send } = useMessageThread(studentId)
  const [draft, setDraft] = useState('')

  // No per-sender identity on `messages` (see types/database) — the thread is
  // strictly 1:1, so a generic role label ("You" / the other party's role)
  // is all we can show without a new join.
  const otherLabel = profile?.role === 'mentor' ? 'Student' : 'Mentor'

  let lastDay = ''

  return (
    <div className="flex flex-col overflow-hidden rounded-panel border border-hairline">
      <div className="flex max-h-[420px] flex-col gap-3.5 overflow-y-auto p-5">
        {loading && <p className="font-mono text-xs font-bold uppercase text-muted">loading…</p>}
        {error && <p className="text-sm font-bold text-danger-text">{error}</p>}
        {!loading && messages.length === 0 && (
          <p className="text-[14.5px] text-muted">No messages yet — say hello.</p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id
          const day = dayLabel(m.created_at)
          const showDivider = day !== lastDay
          lastDay = day
          return (
            <div key={m.id} className="flex flex-col">
              {showDivider && (
                <p className="my-2 text-center font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">{day}</p>
              )}
              <div
                className={`flex max-w-[min(560px,86%)] flex-col gap-1.5 px-4 py-3 text-[14px] leading-relaxed ${
                  mine
                    ? 'self-end rounded-[20px_20px_6px_20px] bg-cream text-ink-on-cream'
                    : 'self-start rounded-[20px_20px_20px_6px] border border-hairline text-body'
                }`}
              >
                <p>{m.body}</p>
                <p className={`font-mono text-[10px] ${mine ? 'text-ink-2-on-cream' : 'text-muted'}`}>
                  {mine ? 'YOU' : otherLabel.toUpperCase()} · {timeLabel(m.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!draft.trim()) return
          void send(draft)
          setDraft('')
        }}
        className="flex items-end gap-2.5 border-t border-hairline p-4"
      >
        <TextAreaField
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          rows={2}
          className="flex-1 resize-y"
        />
        <Button type="submit" variant="primary" disabled={sending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
