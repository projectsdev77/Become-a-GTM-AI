import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import AppNav from '@/components/layout/AppNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import StatusPill from '@/components/ui/StatusPill'
import { Checkbox } from '@/components/ui/Checkbox'
import { Button, LinkButton } from '@/components/ui/Button'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useLessonDetail, type ResourceWithProgress } from '@/hooks/useLessonDetail'
import { useWeekDetail } from '@/hooks/useWeekDetail'

const RESOURCE_TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  article: 'Article',
  docs: 'Docs',
  paper: 'Paper',
  repo: 'Repo',
  tool: 'Tool',
  other: 'Resource',
}

function ResourceRow({
  resource,
  onToggle,
}: {
  resource: ResourceWithProgress
  onToggle: (checked: boolean) => void
}) {
  return (
    <li>
      <Checkbox
        checked={resource.checked}
        onChange={onToggle}
        className="w-full items-start gap-3"
        label={
          <span className="min-w-0 flex-1">
            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-[13.5px] font-bold leading-[1.45] no-underline hover:underline ${
                resource.checked ? 'text-muted line-through' : 'text-body'
              }`}
            >
              {resource.title}
            </a>
            <span className="mt-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
                {RESOURCE_TYPE_LABEL[resource.resource_type] ?? resource.resource_type}
              </span>
              {resource.estimated_minutes && (
                <span className="font-mono text-[10px] text-muted">· {resource.estimated_minutes} min</span>
              )}
              {!resource.is_required && <span className="font-mono text-[10px] uppercase text-muted">· optional</span>}
            </span>
          </span>
        }
      />
    </li>
  )
}

export default function LessonPage() {
  const { lessonId, weekId } = useParams()
  const navigate = useNavigate()
  const { lesson, resources, completedAt, loading, error, toggleResource, markCompleteManually } =
    useLessonDetail(lessonId)
  const { week, lessons, assignments } = useWeekDetail(weekId)

  if (loading) return <FullPageSpinner />

  const requiredResources = resources.filter((r) => r.is_required)
  const doneCount = requiredResources.filter((r) => r.checked).length
  const currentIndex = lessons.findIndex((l) => l.id === lessonId)
  const nextLesson = currentIndex >= 0 ? lessons[currentIndex + 1] : undefined
  const firstAssignment = assignments[0]

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      {week && lesson && (
        <Breadcrumb
          items={[
            { label: 'dashboard', to: '/dashboard' },
            { label: `week ${week.position}`, to: `/weeks/${week.id}` },
            { label: lesson.title.toLowerCase() },
          ]}
        />
      )}

      <main className="mx-auto max-w-[1160px] px-6 py-9">
        {error && <p className="text-sm font-bold text-danger-text">{error}</p>}

        {lesson && (
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-[2_1_460px] rounded-shell border border-hairline p-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                    Week {week?.position} · Lesson {lesson.position}
                    {lesson.estimated_minutes ? ` · ${lesson.estimated_minutes} min` : ''}
                  </p>
                  <h1 className="font-display text-[clamp(24px,3vw,34px)] uppercase leading-[1.08] text-display">
                    {lesson.title}
                  </h1>
                </div>
                {completedAt && <StatusPill variant="pass">complete</StatusPill>}
              </div>

              {lesson.body && (
                <div className="prose prose-invert prose-sm mt-5 max-w-none prose-headings:font-body prose-headings:text-heading prose-p:text-body prose-p:leading-[1.75] prose-strong:text-heading prose-a:text-accent prose-li:text-body prose-code:font-mono prose-code:text-[color:var(--color-code-string)] prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-input prose-pre:border prose-pre:border-hairline prose-pre:bg-inset prose-pre:font-mono prose-pre:text-[12.5px] prose-pre:leading-[1.75] prose-pre:text-code">
                  <ReactMarkdown>{lesson.body}</ReactMarkdown>
                </div>
              )}

              <p className="mt-6 text-[15px] leading-[1.75] text-body">
                Mark each resource in the sidebar as you work through it, then start the assignment.
              </p>

              {resources.length > 0 && (
                <div className="mt-8 flex flex-col gap-4 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                      {completedAt ? 'Next up' : `${doneCount}/${requiredResources.length} required checked`}
                    </p>
                    <p className="mt-1 font-bold text-heading">
                      {completedAt ? (nextLesson?.title ?? 'Nice work') : 'Check off the required resources to continue'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="cta"
                    disabled={!completedAt}
                    onClick={() => {
                      if (nextLesson) {
                        navigate(`/weeks/${weekId}/lessons/${nextLesson.id}`)
                      } else {
                        navigate(`/weeks/${weekId}#assignments`)
                      }
                    }}
                    className="shrink-0"
                  >
                    {nextLesson ? 'Continue' : 'Go to assignments'}
                  </Button>
                </div>
              )}
            </div>

            <aside className="min-w-[240px] flex-[1_1_250px]">
              <div className="sticky top-5 rounded-panel border border-hairline p-6">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Resources</p>

                {resources.length > 0 ? (
                  <ul className="flex flex-col gap-3.5">
                    {resources.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        onToggle={(checked) => void toggleResource(resource.id, checked)}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="text-center">
                    <p className="text-[13.5px] text-muted">No external resources for this lesson.</p>
                    {!completedAt && (
                      <Button type="button" variant="secondary" size="sm" onClick={() => void markCompleteManually()} className="mt-3 w-full">
                        Mark as complete
                      </Button>
                    )}
                  </div>
                )}

                {firstAssignment && (
                  <LinkButton to={`/weeks/${weekId}/assignments/${firstAssignment.id}`} variant="cta" className="mt-6 w-full">
                    Start assignment
                  </LinkButton>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
