import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import ListRow, { RowMeta } from '@/components/ui/ListRow'
import Callout from '@/components/ui/Callout'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { functionErrorMessage } from '@/lib/functionsError'
import type { Resource } from '@/types/database'

interface BrokenResource extends Resource {
  lessonTitle: string
  weekTitle: string
  weekPosition: number
}

function useBrokenResources() {
  const [resources, setResources] = useState<BrokenResource[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    // Deliberately not setLoading(true) here: dismiss()/runCheck() also
    // call refresh(), and flipping loading back to true would unmount the
    // whole page back to a full-page spinner on every action.
    const { data: broken } = await supabase.from('resources').select('*').eq('is_broken', true)
    const lessonIds = [...new Set((broken ?? []).map((r) => r.lesson_id))]
    const { data: lessons } = lessonIds.length
      ? await supabase.from('lessons').select('id, title, week_id').in('id', lessonIds)
      : { data: [] }
    const weekIds = [...new Set((lessons ?? []).map((l) => l.week_id))]
    const { data: weeks } = weekIds.length
      ? await supabase.from('weeks').select('id, title, position').in('id', weekIds)
      : { data: [] }

    const lessonById = new Map((lessons ?? []).map((l) => [l.id, l]))
    const weekById = new Map((weeks ?? []).map((w) => [w.id, w]))

    setResources(
      ((broken ?? []) as Resource[]).map((r) => {
        const lesson = lessonById.get(r.lesson_id)
        const week = lesson ? weekById.get(lesson.week_id) : undefined
        return {
          ...r,
          lessonTitle: lesson?.title ?? 'Unknown lesson',
          weekTitle: week?.title ?? '',
          weekPosition: week?.position ?? 0,
        }
      }),
    )
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  return { resources, loading, refresh }
}

export default function BrokenLinksPage() {
  const { resources, loading, refresh } = useBrokenResources()
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)
  const [lastCheck, setLastCheck] = useState<{ checked: number; brokenCount: number } | null>(null)

  async function dismiss(resourceId: string) {
    await supabase.from('resources').update({ is_broken: false }).eq('id', resourceId)
    await refresh()
  }

  async function alwaysAllow(resourceId: string) {
    await supabase.from('resources').update({ is_broken: false, skip_health_check: true }).eq('id', resourceId)
    await refresh()
  }

  async function runCheck() {
    setChecking(true)
    setCheckError(null)
    const { data, error } = await supabase.functions.invoke('check-resource-links')
    setChecking(false)
    if (error) {
      setCheckError(await functionErrorMessage(error))
      return
    }
    setLastCheck({ checked: data.checked, brokenCount: data.brokenCount })
    await refresh()
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-[clamp(28px,5.2vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
            {resources.length} broken link{resources.length === 1 ? '' : 's'}
          </h1>
          <div className="flex flex-col items-end gap-1.5">
            <Button type="button" variant="secondary" onClick={() => void runCheck()} disabled={checking}>
              {checking ? 'Checking…' : 'Re-run check now'}
            </Button>
            {lastCheck && !checking && (
              <p className="font-mono text-[11px] text-muted">
                checked {lastCheck.checked} · {lastCheck.brokenCount} broken
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 text-[14.5px] text-muted">
          Links that failed a check. Students never see this. Use{' '}
          <span className="font-bold text-display">mark fixed</span> once you&apos;ve fixed a link, or{' '}
          <span className="font-bold text-display">always allow</span> if it keeps flagging a link you&apos;ve confirmed
          works.
        </p>
        {checkError && (
          <Callout tone="fail" className="mt-3">
            {checkError}
          </Callout>
        )}

        <div className="mt-6">
          {resources.length > 0 ? (
            <div className="flex flex-col gap-[clamp(12px,1.6vw,18px)]">
              {resources.map((r) => (
                <ListRow key={r.id} state="active">
                  <div className="min-w-0 flex-1 basis-[280px]">
                    <RowMeta className="mt-0 mb-1.5">
                      Week {r.weekPosition} · {r.lessonTitle}
                    </RowMeta>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate font-mono text-[13px] font-medium text-ink-on-cream"
                    >
                      {r.title} — {r.url}
                    </a>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-4">
                    <span className="font-mono text-[12.5px] font-bold text-accent-on-cream">
                      {r.last_status_code ?? 'timeout'} ·{' '}
                      {r.last_checked_at ? new Date(r.last_checked_at).toLocaleDateString() : 'never checked'}
                    </span>
                    <Link
                      to={`/admin/curriculum/lessons/${r.lesson_id}`}
                      className="whitespace-nowrap text-[12.5px] font-bold text-ink-on-cream underline decoration-2 underline-offset-2"
                    >
                      edit
                    </Link>
                    <button
                      onClick={() => void dismiss(r.id)}
                      className="whitespace-nowrap text-[12.5px] font-bold text-ink-2-on-cream hover:text-ink-on-cream"
                    >
                      mark fixed
                    </button>
                    <button
                      onClick={() => void alwaysAllow(r.id)}
                      title="I've checked this link myself and it works — stop flagging it, even if automated checks keep failing it"
                      className="whitespace-nowrap text-[12.5px] font-bold text-ink-2-on-cream hover:text-ink-on-cream"
                    >
                      always allow
                    </button>
                  </div>
                </ListRow>
              ))}
            </div>
          ) : (
            <Callout tone="pass" heading="all clear">
              No broken links right now.
            </Callout>
          )}
        </div>
      </main>
    </div>
  )
}
