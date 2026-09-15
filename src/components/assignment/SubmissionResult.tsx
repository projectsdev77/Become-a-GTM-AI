import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Submission } from '@/types/database'
import StatusPill from '@/components/ui/StatusPill'
import Callout from '@/components/ui/Callout'
import Card from '@/components/ui/Card'
import { Button, LinkButton } from '@/components/ui/Button'
import { TextAreaField } from '@/components/ui/Field'
import { MessageIcon, CheckIcon } from '@/components/ui/icons'

export default function SubmissionResult({
  submission,
  onFlag,
  onRefresh,
  isLatest,
  continueHref,
}: {
  submission: Submission
  onFlag: (reason: string) => void
  onRefresh?: () => void
  isLatest?: boolean
  continueHref?: string
}) {
  const [showFlagForm, setShowFlagForm] = useState(false)
  const [reason, setReason] = useState('')

  const canFlag =
    submission.final_status !== 'pending' &&
    !submission.flagged_for_review_at &&
    submission.evaluation_status === 'complete'

  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="meta">Attempt {submission.attempt_number}</span>
        {submission.final_status === 'passed' && <StatusPill variant="pass">passed</StatusPill>}
        {submission.final_status === 'needs_work' && <StatusPill variant="warn">needs work</StatusPill>}
        {submission.final_status === 'pending' && <StatusPill variant="progress">evaluating</StatusPill>}
      </div>

      {submission.content && (
        <div className="mt-4 rounded-card border border-line-strong/30 bg-ground-deep p-4">
          <p className="meta mb-1.5 text-on-light-meta">Submission</p>
          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-text-body">{submission.content}</p>
        </div>
      )}

      {(submission.evaluation_status === 'pending' || submission.evaluation_status === 'processing') && (
        <Callout tone="info" className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>Evaluating — usually under a minute.</span>
            {isLatest && onRefresh && (
              <Button type="button" variant="secondary" size="sm" onClick={onRefresh}>
                Check again
              </Button>
            )}
          </div>
        </Callout>
      )}

      {submission.evaluation_status === 'failed' && (
        <Callout tone="warn" className="mt-4">
          We couldn't generate automatic feedback for this attempt. A mentor will take a look soon — you don't need to
          do anything.
        </Callout>
      )}

      {submission.ai_feedback && (
        <Callout
          tone={submission.final_status === 'passed' ? 'pass' : submission.final_status === 'needs_work' ? 'warn' : 'info'}
          heading={
            submission.final_status === 'passed'
              ? 'AI feedback — strong pass'
              : submission.final_status === 'needs_work'
                ? 'AI feedback — needs work'
                : 'Feedback'
          }
          icon={submission.final_status === 'passed' ? <CheckIcon className="h-3.5 w-3.5" /> : <MessageIcon className="h-3.5 w-3.5" />}
          className="mt-4"
        >
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-current prose-code:font-mono prose-code:rounded-[5px] prose-code:bg-[#3A362F] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-text-bright prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown>{submission.ai_feedback}</ReactMarkdown>
          </div>
        </Callout>
      )}

      {submission.human_feedback && (
        <div className="mt-4 rounded-card border border-line p-4">
          <p className="meta mb-1.5">Mentor feedback</p>
          <p className="text-[14.5px] leading-relaxed text-text-body">{submission.human_feedback}</p>
        </div>
      )}

      {submission.flagged_for_review_at && !submission.reviewed_at && (
        <p className="mt-4 text-[13.5px] text-text-muted">
          You asked for a second look on {new Date(submission.flagged_for_review_at).toLocaleDateString()}. A mentor
          will follow up here.
        </p>
      )}

      {submission.final_status === 'passed' && isLatest && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-card bg-pass-wash px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-wide text-pass-deep">
            Nice work — the next week is ready.
          </p>
          {continueHref && (
            <LinkButton to={continueHref} variant="primary" size="sm" className="shrink-0">
              Continue
            </LinkButton>
          )}
        </div>
      )}
      {submission.final_status === 'needs_work' && isLatest && (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-wide text-warn">
          Give it another attempt when you're ready — retries don't cost you anything.
        </p>
      )}

      {canFlag && (
        <div className="mt-5 border-t border-line-strong/30 pt-4">
          {showFlagForm ? (
            <div className="space-y-2">
              <TextAreaField
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What would you like a mentor to take another look at?"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onFlag(reason)
                    setShowFlagForm(false)
                  }}
                >
                  Request review
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowFlagForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button type="button" variant="secondary" onClick={() => setShowFlagForm(true)}>
                Escalate to mentor
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
