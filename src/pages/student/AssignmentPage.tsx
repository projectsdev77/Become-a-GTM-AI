import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Callout from '@/components/ui/Callout'
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
  const { week, assignments } = useWeekDetail(weekId)
  const currentIndex = assignments.findIndex((a) => a.id === assignmentId)
  const nextAssignment = currentIndex >= 0 ? assignments[currentIndex + 1] : undefined
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
    refresh,
  } = useAssignmentDetail(assignmentId)

  if (loading) return <FullPageSpinner />

  const rateLimited = secondsUntilNextAttempt > 0
  const formDisabled = submitting || rateLimited
  const alreadyPassed = latest?.final_status === 'passed'

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />

      <main className="mx-auto max-w-[820px] px-6 py-9">
        {week && assignment && (
          <Breadcrumb
            items={[
              { label: 'dashboard', to: '/dashboard' },
              { label: `week ${week.position}`, to: `/weeks/${week.id}` },
              { label: assignment.title.toLowerCase() },
            ]}
          />
        )}
        {error && <p className="text-sm font-bold text-danger-text">{error}</p>}

        {assignment && (
          <>
            <div className="rounded-shell border border-hairline p-9">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="rounded-pill border border-border-secondary px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-display">
                  {TYPE_LABEL[assignment.assignment_type] ?? assignment.assignment_type}
                </span>
                {assignment.assignment_type === 'text' && (
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                    {textConfig(assignment).min_words}–{textConfig(assignment).max_words} words
                  </span>
                )}
                {assignment.assignment_type === 'url' && urlConfig(assignment).allowed_hosts?.length > 0 && (
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                    accepted: {urlConfig(assignment).allowed_hosts.join(', ')}
                  </span>
                )}
                {assignment.assignment_type === 'quiz' && (
                  <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
                    pass threshold {quizConfig(assignment).pass_threshold}% · attempt {submissions.length + 1}
                  </span>
                )}
              </div>

              <h1 className="mb-4 font-display text-[clamp(22px,2.8vw,30px)] uppercase leading-[1.1] text-display">
                {assignment.title}
              </h1>
              <div className="prose prose-invert prose-sm max-w-none prose-p:text-body prose-p:leading-[1.75] prose-a:text-accent">
                <ReactMarkdown>{assignment.instructions}</ReactMarkdown>
              </div>

              {!alreadyPassed && (
                <div className="mt-7">
                  {rateLimited && (
                    <Callout tone="warn" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mb-4">
                      You can submit again in {secondsUntilNextAttempt}s.
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
                </div>
              )}
            </div>

            {submissions.length > 0 && (
              <section className="mt-8">
                <p className="meta mb-3">{submissions.length > 1 ? 'Attempts' : 'Your submission'}</p>
                <div className="space-y-4">
                  {submissions.map((s) => (
                    <SubmissionResult
                      key={s.id}
                      submission={s}
                      isLatest={s.id === latest?.id}
                      continueHref={nextAssignment ? `/weeks/${weekId}/assignments/${nextAssignment.id}` : week ? '/dashboard' : undefined}
                      nextAssignmentTitle={nextAssignment?.title}
                      onRefresh={() => void refresh()}
                      onFlag={(reason) => {
                        if (s.id === latest?.id) void flagForReview(reason)
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
