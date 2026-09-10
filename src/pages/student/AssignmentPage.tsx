import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Callout from '@/components/ui/Callout'
import StatusPill from '@/components/ui/StatusPill'
import { AlertIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import {
  quizConfig,
  textConfig,
  urlConfig,
  useAssignmentDetail,
} from '@/hooks/useAssignmentDetail'
import { useWeekDetail } from '@/hooks/useWeekDetail'
import QuizForm from '@/components/assignment/QuizForm'
import TextForm from '@/components/assignment/TextForm'
import UrlForm from '@/components/assignment/UrlForm'
import SubmissionResult from '@/components/assignment/SubmissionResult'

const TYPE_LABEL: Record<string, string> = { quiz: 'Quiz', text: 'Text', url: 'URL' }

export default function AssignmentPage() {
  const { assignmentId, weekId } = useParams()
  const { week } = useWeekDetail(weekId)
  const {
    assignment,
    questions,
    submissions,
    latest,
    secondsUntilNextAttempt,
    loading,
    submitting,
    error,
    submitText,
    submitQuiz,
    flagForReview,
  } = useAssignmentDetail(assignmentId)

  if (loading) return <FullPageSpinner />

  const rateLimited = secondsUntilNextAttempt > 0
  const formDisabled = submitting || rateLimited
  const alreadyPassed = latest?.final_status === 'passed'
  const olderSubmissions = submissions.filter((s) => s.id !== latest?.id)

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      {week && assignment && (
        <Breadcrumb
          items={[
            { label: 'dashboard', to: '/dashboard' },
            { label: `week ${week.position}`, to: `/weeks/${week.id}` },
            { label: assignment.title.toLowerCase() },
          ]}
        />
      )}

      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        {error && <p className="text-sm font-bold text-fail-ink">{error}</p>}

        {assignment && (
          <div className="grid gap-8 lg:grid-cols-[1.7fr_0.85fr]">
            <div className="max-w-[760px]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="pill" style={{ background: 'var(--color-ink)', borderColor: 'var(--color-ink)', color: '#fff' }}>
                  {TYPE_LABEL[assignment.assignment_type] ?? assignment.assignment_type}
                </span>
                {assignment.assignment_type === 'text' && (
                  <span className="font-mono text-[11px] text-muted">
                    {textConfig(assignment).min_words}–{textConfig(assignment).max_words} words
                  </span>
                )}
                {assignment.assignment_type === 'url' && urlConfig(assignment).allowed_hosts?.length > 0 && (
                  <span className="font-mono text-[11px] text-muted">
                    accepted: {urlConfig(assignment).allowed_hosts.join(', ')}
                  </span>
                )}
                {assignment.assignment_type === 'quiz' && (
                  <span className="font-mono text-[11px] text-muted">
                    pass threshold {quizConfig(assignment).pass_threshold}% · attempt {submissions.length + 1}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-[36px] font-bold tracking-[-0.035em] text-ink">{assignment.title}</h1>
              <div className="prose mt-4 max-w-[62ch] text-[17px] leading-[1.75] text-ink">
                <ReactMarkdown>{assignment.instructions}</ReactMarkdown>
              </div>

              {!alreadyPassed && (
                <div className="card mt-8">
                  {rateLimited && (
                    <Callout tone="warn" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mb-4">
                      You've used this attempt — you can submit again in {secondsUntilNextAttempt}s.
                    </Callout>
                  )}

                  {assignment.assignment_type === 'quiz' && (
                    <QuizForm questions={questions} disabled={formDisabled} onSubmit={submitQuiz} />
                  )}
                  {assignment.assignment_type === 'text' && (
                    <TextForm config={textConfig(assignment)} disabled={formDisabled} onSubmit={submitText} />
                  )}
                  {assignment.assignment_type === 'url' && (
                    <UrlForm config={urlConfig(assignment)} disabled={formDisabled} onSubmit={submitText} />
                  )}
                  {assignment.assignment_type !== 'quiz' && (
                    <p className="mt-3 text-center text-[13px] text-muted">Feedback usually arrives in under a minute.</p>
                  )}
                </div>
              )}

              {latest && (
                <section className="mt-10">
                  <p className="meta">{submissions.length > 1 ? 'Latest attempt' : 'Your submission'}</p>
                  <div className="mt-3">
                    <SubmissionResult
                      submission={latest}
                      isLatest
                      continueHref={week ? '/dashboard' : undefined}
                      onFlag={(reason) => void flagForReview(reason)}
                    />
                  </div>
                </section>
              )}

              {olderSubmissions.length > 0 && (
                <section className="mt-6">
                  <p className="meta">Earlier attempts</p>
                  <div className="mt-3 space-y-2">
                    {olderSubmissions.map((s) => (
                      <div key={s.id} className="card flex items-center justify-between gap-4">
                        <p className="font-mono text-[12px] text-muted">
                          attempt {s.attempt_number} · {new Date(s.submitted_at).toLocaleDateString()}
                        </p>
                        <StatusPill variant={s.final_status === 'passed' ? 'pass' : s.final_status === 'needs_work' ? 'warn' : 'progress'}>
                          {s.final_status === 'passed' ? 'passed' : s.final_status === 'needs_work' ? 'needs work' : 'evaluating'}
                        </StatusPill>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside>
              <Callout tone="info" heading="disagree with a grade?">
                Ask a mentor for a second look from your submission — flagging for review never lowers a grade, it only
                adds a human read.
              </Callout>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
