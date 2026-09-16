import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { Field, Label, TextAreaField } from '@/components/ui/Field'
import { Checkbox } from '@/components/ui/Checkbox'
import { AlertIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import QuizQuestionEditor from '@/components/admin/QuizQuestionEditor'
import { useAdminCollection } from '@/hooks/useAdminCollection'
import type { Assignment, QuizQuestion, TextConfig, UrlConfig, QuizConfig } from '@/types/database'

function useAssignment(assignmentId: string | undefined) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!assignmentId) return
    // Deliberately not setLoading(true) here: save() also calls refresh(),
    // and flipping loading back to true would unmount the whole editor
    // back to a full-page spinner on every save.
    const { data } = await supabase.from('assignments').select('*').eq('id', assignmentId).single()
    setAssignment(data as Assignment)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId])

  return { assignment, loading, refresh }
}

export default function AssignmentEditorPage() {
  const { assignmentId } = useParams()
  const { assignment, loading, refresh } = useAssignment(assignmentId)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [form, setForm] = useState({ title: '', instructions: '', rubric: '' })
  const [config, setConfig] = useState<Record<string, unknown>>({})

  const questions = useAdminCollection<QuizQuestion>('quiz_questions', 'assignment_id', assignmentId)

  useEffect(() => {
    if (assignment) {
      setForm({
        title: assignment.title,
        instructions: assignment.instructions,
        rubric: assignment.rubric ?? '',
      })
      setConfig(assignment.config as Record<string, unknown>)
    }
  }, [assignment])

  async function save() {
    if (!assignmentId) return
    setSaving(true)
    await supabase
      .from('assignments')
      .update({
        title: form.title,
        instructions: form.instructions,
        rubric: form.rubric || null,
        config,
      })
      .eq('id', assignmentId)
    setSaving(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
    await refresh()
  }

  async function addQuestion() {
    const question = await questions.create({ prompt: 'New question' })
    if (!question) return
    await supabase.from('quiz_options').insert([
      { question_id: question.id, position: 1, text: 'Option A', is_correct: true },
      { question_id: question.id, position: 2, text: 'Option B', is_correct: false },
    ])
    await questions.refresh()
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      {assignment && (
        <div className="border-b border-hairline">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <Breadcrumb items={[{ label: 'curriculum', to: '/admin/curriculum' }, { label: 'week', to: `/admin/curriculum/weeks/${assignment.week_id}` }, { label: 'assignment' }]} />
            <div className="flex items-center gap-3">
              {justSaved && <span className="font-mono text-[11px] font-bold uppercase text-pass">saved</span>}
              <Button type="button" variant="primary" size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        {assignment && (
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div>
              <div className="rounded-panel border border-hairline p-7">
                <span className="badge badge-pending mb-4 inline-flex">{assignment.assignment_type}</span>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Field id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mb-5" />
                </div>
                <div>
                  <Label htmlFor="instructions">Student-facing brief (markdown)</Label>
                  <TextAreaField
                    id="instructions"
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    rows={5}
                    className="font-mono text-[13px]"
                  />
                </div>
                {assignment.assignment_type !== 'quiz' && (
                  <div className="mt-5">
                    <Label htmlFor="rubric">Rubric (sent to the AI grader, never shown to students)</Label>
                    <TextAreaField id="rubric" value={form.rubric} onChange={(e) => setForm({ ...form, rubric: e.target.value })} rows={4} />
                  </div>
                )}

                {assignment.assignment_type === 'text' && (
                  <div className="mt-5 flex gap-4">
                    <div>
                      <Label htmlFor="min_words">Min words</Label>
                      <Field
                        id="min_words"
                        type="number"
                        value={(config as unknown as TextConfig).min_words ?? ''}
                        onChange={(e) => setConfig({ ...config, min_words: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max_words">Max words</Label>
                      <Field
                        id="max_words"
                        type="number"
                        value={(config as unknown as TextConfig).max_words ?? ''}
                        onChange={(e) => setConfig({ ...config, max_words: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                  </div>
                )}

                {assignment.assignment_type === 'url' && (
                  <div className="mt-5 flex flex-wrap items-end gap-4">
                    <div className="min-w-[220px] flex-1">
                      <Label htmlFor="hosts">Allowed hosts (comma-separated)</Label>
                      <Field
                        id="hosts"
                        value={((config as unknown as UrlConfig).allowed_hosts ?? []).join(', ')}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            allowed_hosts: e.target.value.split(',').map((h) => h.trim()).filter(Boolean),
                          })
                        }
                        placeholder="github.com"
                      />
                    </div>
                    <Checkbox
                      checked={Boolean((config as unknown as UrlConfig).require_public)}
                      onChange={(checked) => setConfig({ ...config, require_public: checked })}
                      label="Require public"
                    />
                  </div>
                )}

                {assignment.assignment_type === 'quiz' && (
                  <div className="mt-5">
                    <Label htmlFor="pass_threshold">Pass threshold (%)</Label>
                    <Field
                      id="pass_threshold"
                      type="number"
                      value={(config as unknown as QuizConfig).pass_threshold ?? ''}
                      onChange={(e) => setConfig({ ...config, pass_threshold: Number(e.target.value) })}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              {assignment.assignment_type === 'quiz' && (
                <section className="mt-6 rounded-panel border border-hairline p-7">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[16px] font-bold text-heading">Quiz builder</h2>
                    <p className="font-mono text-[11px] font-bold uppercase text-muted">{questions.items.length} questions</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {questions.items.map((q, i) => (
                      <QuizQuestionEditor
                        key={q.id}
                        question={q}
                        canMoveUp={i > 0}
                        canMoveDown={i < questions.items.length - 1}
                        onMoveUp={() => void questions.moveUp(q.id)}
                        onMoveDown={() => void questions.moveDown(q.id)}
                        onUpdate={(fields) => questions.update(q.id, fields)}
                        onDelete={() => questions.remove(q.id)}
                      />
                    ))}
                    <button
                      onClick={() => void addQuestion()}
                      className="w-full rounded-input border border-dashed border-border-secondary py-3 font-mono text-xs font-bold uppercase text-muted hover:border-muted hover:text-display"
                    >
                      + add question
                    </button>
                  </div>
                </section>
              )}
            </div>

            <aside>
              <div className="rounded-panel border border-danger-border p-6">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-alert text-white">
                    <AlertIcon className="h-3 w-3" />
                  </span>
                  <p className="text-[14px] font-bold text-heading">Grading rubric — admin only</p>
                </div>
                <p className="text-[13px] leading-relaxed text-body">
                  Never rendered to students, in any view. This text is sent to the AI grader only so the rubric
                  can&apos;t be gamed.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
