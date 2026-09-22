import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import StatusToggle from '@/components/admin/StatusToggle'
import ReorderButtons from '@/components/admin/ReorderButtons'
import ListRow from '@/components/ui/ListRow'
import Callout from '@/components/ui/Callout'
import { Button } from '@/components/ui/Button'
import { Field, Label, SelectField, TextAreaField } from '@/components/ui/Field'
import { AssignmentIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useAdminCollection } from '@/hooks/useAdminCollection'
import type { Assignment, Lesson, Week } from '@/types/database'

function useWeek(weekId: string | undefined) {
  const [week, setWeek] = useState<Week | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!weekId) return
    // Deliberately not setLoading(true) here: saveWeek()/togglePublish()
    // also call refresh(), and flipping loading back to true would
    // unmount the whole editor back to a full-page spinner on every save.
    const { data } = await supabase.from('weeks').select('*').eq('id', weekId).single()
    setWeek(data as Week)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId])

  return { week, loading, refresh }
}

export default function WeekEditorPage() {
  const { weekId } = useParams()
  const { week, loading, refresh } = useWeek(weekId)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [form, setForm] = useState({ title: '', goal: '', summary: '', estimated_hours: '' })
  const [newLessonTitle, setNewLessonTitle] = useState('')
  const [newAssignment, setNewAssignment] = useState({ title: '', type: 'text' as Assignment['assignment_type'] })

  const lessons = useAdminCollection<Lesson>('lessons', 'week_id', weekId)
  const assignments = useAdminCollection<Assignment>('assignments', 'week_id', weekId)

  useEffect(() => {
    if (week) {
      setForm({
        title: week.title,
        goal: week.goal ?? '',
        summary: week.summary ?? '',
        estimated_hours: week.estimated_hours != null ? String(week.estimated_hours) : '',
      })
    }
  }, [week])

  async function saveWeek() {
    if (!weekId) return
    setSaving(true)
    await supabase
      .from('weeks')
      .update({
        title: form.title,
        goal: form.goal || null,
        summary: form.summary || null,
        estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
      })
      .eq('id', weekId)
    setSaving(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
    await refresh()
  }

  async function togglePublish() {
    if (!weekId || !week) return
    const nowPublishing = week.status !== 'published'
    await supabase
      .from('weeks')
      .update({ status: nowPublishing ? 'published' : 'draft', published_at: nowPublishing ? new Date().toISOString() : null })
      .eq('id', weekId)
    await refresh()
  }

  function slugify(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      {week && (
        <div className="border-b border-hairline">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <Breadcrumb items={[{ label: 'curriculum', to: '/admin/curriculum' }, { label: `week ${String(week.position).padStart(2, '0')}` }]} />
            <div className="flex items-center gap-3">
              {justSaved && <span className="font-mono text-[11px] font-bold uppercase text-pass">saved</span>}
              <Button type="button" variant="primary" size="sm" onClick={() => void saveWeek()} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        {week && (
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="rounded-panel border border-hairline p-7">
                <div className="flex items-center justify-between">
                  <p className="meta">Week details</p>
                  <StatusToggle status={week.status} onChange={() => void togglePublish()} />
                </div>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
                    <div>
                      <Label htmlFor="position">Number</Label>
                      <Field id="position" value={String(week.position).padStart(2, '0')} disabled className="font-mono" />
                    </div>
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Field id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="goal">Week goal</Label>
                    <TextAreaField
                      id="goal"
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      rows={3}
                      placeholder="What the student should be able to do"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                    <div>
                      <Label htmlFor="summary">
                        Summary <span className="normal-case text-muted">· markdown · shown on the public curriculum page</span>
                      </Label>
                      <TextAreaField id="summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="hours">Est. hours</Label>
                      <Field
                        id="hours"
                        type="number"
                        step="0.5"
                        value={form.estimated_hours}
                        onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <section className="mt-6 rounded-panel border border-hairline p-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-[19px] font-bold text-heading">Lessons</h2>
                  <p className="font-mono text-[11px] font-bold uppercase text-muted">{lessons.items.length} total</p>
                </div>
                <div className="mt-4 flex flex-col gap-2.5">
                  {lessons.items.map((lesson, i) => {
                    const published = lesson.status === 'published'
                    return (
                    <ListRow key={lesson.id} state={published ? 'active' : 'default'} className="!py-3.5">
                      <div className="flex min-w-0 flex-1 basis-[220px] items-center gap-3.5">
                        <ReorderButtons
                          canMoveUp={i > 0}
                          canMoveDown={i < lessons.items.length - 1}
                          onMoveUp={() => void lessons.moveUp(lesson.id)}
                          onMoveDown={() => void lessons.moveDown(lesson.id)}
                        />
                        <Link
                          to={`/admin/curriculum/lessons/${lesson.id}`}
                          className={`min-w-0 flex-1 font-bold no-underline ${published ? 'text-ink-on-cream' : 'text-display'}`}
                        >
                          {String(lesson.position).padStart(2, '0')} · {lesson.title}
                        </Link>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <StatusToggle status={lesson.status} onChange={(next) => void lessons.update(lesson.id, { status: next })} />
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${lesson.title}"?`)) void lessons.remove(lesson.id)
                          }}
                          className={`font-mono text-[11px] font-bold uppercase hover:underline ${published ? 'text-danger-border' : 'text-danger-text'}`}
                        >
                          del
                        </button>
                      </div>
                    </ListRow>
                    )
                  })}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!newLessonTitle.trim()) return
                      void lessons.create({ title: newLessonTitle.trim(), slug: slugify(newLessonTitle), status: 'draft' })
                      setNewLessonTitle('')
                    }}
                    className="flex gap-2 rounded-input border border-dashed border-border-secondary p-3"
                  >
                    <Field value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} placeholder="New lesson title…" className="flex-1" />
                    <Button type="submit" variant="secondary">
                      + Add lesson
                    </Button>
                  </form>
                </div>
              </section>

              <section className="mt-6 rounded-panel border border-hairline p-7">
                <p className="meta">Assignments · {assignments.items.length}</p>
                <div className="mt-4 flex flex-col gap-2.5">
                  {assignments.items.map((assignment, i) => (
                    <ListRow key={assignment.id} state="pending" className="!py-3.5">
                      <div className="flex min-w-0 flex-1 basis-[220px] items-center gap-3.5">
                        <ReorderButtons
                          canMoveUp={i > 0}
                          canMoveDown={i < assignments.items.length - 1}
                          onMoveUp={() => void assignments.moveUp(assignment.id)}
                          onMoveDown={() => void assignments.moveDown(assignment.id)}
                        />
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-chip border border-border-secondary">
                          <AssignmentIcon className="h-4 w-4 text-muted" />
                        </span>
                        <Link
                          to={`/admin/curriculum/assignments/${assignment.id}`}
                          className="min-w-0 flex-1 font-bold text-display no-underline"
                        >
                          {assignment.title}
                        </Link>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="badge badge-pending">{assignment.assignment_type}</span>
                        <StatusToggle status={assignment.status} onChange={(next) => void assignments.update(assignment.id, { status: next })} />
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${assignment.title}"?`)) void assignments.remove(assignment.id)
                          }}
                          className="font-mono text-[11px] font-bold uppercase text-danger-text hover:underline"
                        >
                          del
                        </button>
                      </div>
                    </ListRow>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!newAssignment.title.trim()) return
                      const config =
                        newAssignment.type === 'quiz'
                          ? { pass_threshold: 70 }
                          : newAssignment.type === 'text'
                            ? { min_words: 150, max_words: 800 }
                            : { allowed_hosts: [], require_public: true }
                      void assignments.create({
                        title: newAssignment.title.trim(),
                        instructions: 'TODO: add instructions',
                        assignment_type: newAssignment.type,
                        config,
                        status: 'draft',
                      })
                      setNewAssignment({ title: '', type: 'text' })
                    }}
                    className="flex flex-wrap gap-2 rounded-input border border-dashed border-border-secondary p-3"
                  >
                    <Field
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      placeholder="New assignment title…"
                      className="min-w-[160px] flex-1"
                    />
                    <SelectField
                      value={newAssignment.type}
                      onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value as Assignment['assignment_type'] })}
                      className="w-auto"
                    >
                      <option value="text">Text</option>
                      <option value="url">URL</option>
                      <option value="quiz">Quiz</option>
                    </SelectField>
                    <Button type="submit" variant="secondary">
                      + Add
                    </Button>
                  </form>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <div className="rounded-panel border border-hairline p-6">
                <p className="meta mb-3">Visibility</p>
                <StatusToggle status={week.status} onChange={() => void togglePublish()} />
                <p className="mt-4 text-[13.5px] text-muted">
                  Unpublishing hides the week from the public curriculum page. Students who already unlocked it keep
                  access.
                </p>
                {week.published_at && (
                  <p className="mt-3 font-mono text-[11px] text-muted">
                    published {new Date(week.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <Callout tone="info" heading="editing a live week">
                Changes appear for students immediately on save. Resource checkboxes they&apos;ve already ticked are
                preserved.
              </Callout>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
