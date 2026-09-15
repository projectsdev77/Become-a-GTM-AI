import { useState } from 'react'
import type { QueueItem } from '@/hooks/useExceptionQueue'
import StatusPill from '@/components/ui/StatusPill'
import Callout from '@/components/ui/Callout'
import { Button } from '@/components/ui/Button'
import { TextAreaField } from '@/components/ui/Field'
import Avatar from '@/components/ui/Avatar'
import { CheckIcon, AlertIcon, MessageIcon } from '@/components/ui/icons'

export default function QueueCard({
  item,
  onResolve,
}: {
  item: QueueItem
  onResolve?: (status: 'passed' | 'needs_work', feedback: string) => Promise<boolean>
}) {
  const [status, setStatus] = useState<'passed' | 'needs_work'>('needs_work')
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  const isFailed = item.evaluation_status === 'failed'
  const cause = isFailed ? 'Grader failed' : 'Student flagged'

  async function handleResolve() {
    if (!onResolve || !feedback.trim()) return
    setSaving(true)
    const ok = await onResolve(status, feedback.trim())
    setSaving(false)
    if (ok) setFeedback('')
  }

  return (
    <div className={`rounded-panel p-6 ${isFailed ? 'bg-card-light' : 'border border-line'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={item.studentName} size={40} />
          <div>
            <p className={`font-bold ${isFailed ? 'text-on-light' : 'text-text-bright'}`}>{item.studentName}</p>
            <p className={`text-[13px] ${isFailed ? 'text-on-light-mute' : 'text-text-muted'}`}>
              Week {item.weekPosition} · {item.assignmentTitle} · attempt {item.attempt_number}
            </p>
          </div>
        </div>
        <div className="text-right">
          <StatusPill variant={isFailed ? 'fail' : 'warn'}>{cause}</StatusPill>
          <p className={`mt-1.5 font-mono text-[11px] ${isFailed ? 'text-on-light-meta' : 'text-text-muted'}`}>
            {new Date(item.submitted_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {item.content && (
          <div className={`rounded-card p-4 ${isFailed ? 'bg-card-pressed' : 'border border-line'}`}>
            <p className={`meta mb-1.5 ${isFailed ? 'text-on-light-meta' : ''}`}>Submission</p>
            <p className={`whitespace-pre-wrap text-[14px] leading-relaxed ${isFailed ? 'text-on-light' : 'text-text-body'}`}>
              {item.content}
            </p>
          </div>
        )}
        {item.flag_reason && (
          <Callout tone="warn" heading="why the student flagged this" icon={<AlertIcon className="h-3.5 w-3.5" />}>
            {item.flag_reason}
          </Callout>
        )}
        {item.ai_error && !item.flag_reason && (
          <Callout tone="fail" heading="error" icon={<AlertIcon className="h-3.5 w-3.5" />}>
            <span className="font-mono text-[13px]">{item.ai_error}</span>
          </Callout>
        )}
      </div>

      {item.ai_feedback && (
        <Callout tone="info" heading="AI feedback" icon={<MessageIcon className="h-3.5 w-3.5" />} className="mt-3">
          {item.ai_feedback}
        </Callout>
      )}

      {item.reviewed_at ? (
        <div className={`mt-5 border-t pt-4 ${isFailed ? 'border-[rgba(34,31,27,.18)]' : 'border-line'}`}>
          <p className={`meta ${isFailed ? 'text-on-light-meta' : ''}`}>
            Resolved: {item.final_status === 'passed' ? 'passed' : 'needs work'}
          </p>
          {item.human_feedback && (
            <p className={`mt-1.5 text-[14.5px] ${isFailed ? 'text-on-light' : 'text-text-bright'}`}>{item.human_feedback}</p>
          )}
        </div>
      ) : (
        onResolve && (
          <div className={`mt-5 space-y-3 border-t pt-4 ${isFailed ? 'border-[rgba(34,31,27,.18)]' : 'border-line'}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`meta ${isFailed ? 'text-on-light-meta' : ''}`}>Verdict</span>
              <Button type="button" size="sm" variant={status === 'passed' ? 'primary' : 'secondary'} onClick={() => setStatus('passed')}>
                <CheckIcon className="h-3.5 w-3.5" /> Pass
              </Button>
              <Button
                type="button"
                size="sm"
                variant={status === 'needs_work' ? 'primary' : 'secondary'}
                onClick={() => setStatus('needs_work')}
              >
                <AlertIcon className="h-3.5 w-3.5" /> Needs work
              </Button>
            </div>
            <TextAreaField
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback for the student…"
              rows={2}
            />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className={`font-mono text-[11px] font-bold uppercase tracking-wide ${isFailed ? 'text-on-light-meta' : 'text-text-muted'}`}>
                student is notified immediately on resolve
              </p>
              <Button type="button" variant="primary" onClick={() => void handleResolve()} disabled={saving || !feedback.trim()}>
                {saving ? 'Saving…' : 'Resolve'}
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  )
}
