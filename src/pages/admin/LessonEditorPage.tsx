import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ReorderButtons from '@/components/admin/ReorderButtons'
import { Button } from '@/components/ui/Button'
import { Field, Label, TextAreaField, FieldError } from '@/components/ui/Field'
import { Checkbox } from '@/components/ui/Checkbox'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useAdminCollection } from '@/hooks/useAdminCollection'
import type { Lesson, Resource, ResourceType } from '@/types/database'

const RESOURCE_TYPES: ResourceType[] = ['video', 'article', 'docs', 'paper', 'repo', 'tool', 'other']

function ResourceRow({
  resource,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onUpdate,
  onDelete,
}: {
  resource: Resource
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onUpdate: (fields: Partial<Resource>) => void
  onDelete: () => void
}) {
  const [title, setTitle] = useState(resource.title)
  const [url, setUrl] = useState(resource.url)

  useEffect(() => setTitle(resource.title), [resource.title])
  useEffect(() => setUrl(resource.url), [resource.url])

  return (
    <div className={`rounded-field border p-3.5 ${resource.is_broken ? 'border-fail-border' : 'border-line'}`}>
      <div className="flex flex-wrap items-center gap-3">
        <ReorderButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${resource.is_broken ? 'bg-fail' : 'bg-pass'}`}
          title={resource.is_broken ? 'Broken link' : 'Link healthy'}
        />
        <select
          value={resource.resource_type}
          onChange={(e) => onUpdate({ resource_type: e.target.value as ResourceType })}
          className="rounded-pill border border-line-strong bg-ground-deep px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-text-body"
        >
          {RESOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="grid min-w-0 flex-1 gap-1.5 sm:grid-cols-2">
          <Field
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && onUpdate({ title: title.trim() })}
            placeholder="Resource title…"
          />
          <Field
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => url.trim() && onUpdate({ url: url.trim() })}
            className="font-mono text-[12px]"
            placeholder="https://…"
          />
        </div>
        <Checkbox
          checked={resource.is_required}
          onChange={(checked) => onUpdate({ is_required: checked })}
          label={<span className="font-mono text-[11px] font-bold uppercase text-text-muted">required</span>}
        />
        {resource.is_broken && <span className="font-mono text-[10.5px] font-bold uppercase text-fail-text">broken</span>}
        <button
          onClick={() => {
            if (confirm(`Delete "${resource.title}"?`)) onDelete()
          }}
          className="font-mono text-[11px] font-bold uppercase text-fail-text hover:underline"
        >
          del
        </button>
      </div>
    </div>
  )
}

function useLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    if (!lessonId) return
    // Deliberately not setLoading(true) here: saveLesson() also calls
    // refresh(), and flipping loading back to true would unmount the
    // whole editor back to a full-page spinner on every save.
    const { data } = await supabase.from('lessons').select('*').eq('id', lessonId).single()
    setLesson(data as Lesson)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  return { lesson, loading, refresh }
}

export default function LessonEditorPage() {
  const { lessonId } = useParams()
  const { lesson, loading, refresh } = useLesson(lessonId)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', estimated_minutes: '' })
  const [newResource, setNewResource] = useState({ title: '', url: '', resource_type: 'article' as ResourceType })
  const [newResourceError, setNewResourceError] = useState<string | null>(null)

  const resources = useAdminCollection<Resource>('resources', 'lesson_id', lessonId)

  useEffect(() => {
    if (lesson) {
      setForm({
        title: lesson.title,
        body: lesson.body ?? '',
        estimated_minutes: lesson.estimated_minutes != null ? String(lesson.estimated_minutes) : '',
      })
    }
  }, [lesson])

  async function saveLesson() {
    if (!lessonId) return
    setSaving(true)
    await supabase
      .from('lessons')
      .update({
        title: form.title,
        body: form.body || null,
        estimated_minutes: form.estimated_minutes ? Number(form.estimated_minutes) : null,
      })
      .eq('id', lessonId)
    setSaving(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 3000)
    await refresh()
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      {lesson && (
        <div className="border-b border-line">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <Breadcrumb items={[{ label: 'curriculum', to: '/admin/curriculum' }, { label: 'week', to: `/admin/curriculum/weeks/${lesson.week_id}` }, { label: 'lesson' }]} />
            <div className="flex items-center gap-3">
              {justSaved && <span className="font-mono text-[11px] font-bold uppercase text-pass-deep">saved</span>}
              <Button type="button" variant="site" size="sm" onClick={() => void saveLesson()} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        {lesson && (
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-panel border border-line p-7">
              <Label htmlFor="title">Title</Label>
              <Field id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mb-5" />

              <Label htmlFor="body">
                Body <span className="normal-case text-text-muted">· markdown · keep it short, the substance is in the resources</span>
              </Label>
              <TextAreaField
                id="body"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={10}
                className="font-mono text-[13px]"
              />

              <div className="mt-5">
                <Label htmlFor="minutes">Estimated minutes</Label>
                <Field
                  id="minutes"
                  type="number"
                  value={form.estimated_minutes}
                  onChange={(e) => setForm({ ...form, estimated_minutes: e.target.value })}
                  className="w-28"
                />
              </div>
            </div>

            <aside className="rounded-panel border border-line p-6">
              <div className="flex items-center justify-between">
                <p className="meta">Resources · {resources.items.length}</p>
              </div>
              <div className="mt-3 space-y-2.5">
                {resources.items.map((resource, i) => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    canMoveUp={i > 0}
                    canMoveDown={i < resources.items.length - 1}
                    onMoveUp={() => void resources.moveUp(resource.id)}
                    onMoveDown={() => void resources.moveDown(resource.id)}
                    onUpdate={(fields) => void resources.update(resource.id, fields)}
                    onDelete={() => void resources.remove(resource.id)}
                  />
                ))}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!newResource.title.trim() || !newResource.url.trim()) {
                      setNewResourceError('Title and URL are both required.')
                      return
                    }
                    setNewResourceError(null)
                    void resources.create({
                      title: newResource.title.trim(),
                      url: newResource.url.trim(),
                      resource_type: newResource.resource_type,
                      is_required: true,
                    })
                    setNewResource({ title: '', url: '', resource_type: 'article' })
                  }}
                  className="rounded-field border border-dashed border-line-strong p-3"
                >
                  <div className="space-y-2">
                    <Field
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      placeholder="Resource title…"
                      error={Boolean(newResourceError) && !newResource.title.trim()}
                    />
                    <Field
                      value={newResource.url}
                      onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                      placeholder="https://…"
                      error={Boolean(newResourceError) && !newResource.url.trim()}
                    />
                    <select
                      value={newResource.resource_type}
                      onChange={(e) => setNewResource({ ...newResource, resource_type: e.target.value as ResourceType })}
                      className="field"
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Button type="submit" variant="primary" glyph="+" className="w-full">
                      Add resource
                    </Button>
                  </div>
                  {newResourceError && <FieldError>{newResourceError}</FieldError>}
                  {resources.error && <FieldError>{resources.error}</FieldError>}
                </form>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
