import { useState } from 'react'
import AppNav from '@/components/layout/AppNav'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import QueueCard from '@/components/queue/QueueCard'
import { IllEmptyQueue } from '@/components/ui/illustrations'

// Mentor-only (see App.tsx): admins no longer evaluate submissions, so
// there is no admin route into this page and no mentor-reassignment
// affordance here — that lived in the admin variant, removed with it.
export default function ExceptionQueuePage() {
  const { open, resolved, loading, error, resolve } = useExceptionQueue()
  const [tab, setTab] = useState<'open' | 'resolved'>('open')

  if (loading) return <FullPageSpinner />

  const list = tab === 'open' ? open : resolved

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Worklist · oldest first</p>
            <h1 className="mt-2 font-display text-[38px] font-bold tracking-[-0.035em] text-ink">Exception queue</h1>
            <p className="mt-1 text-[15px] text-muted">
              Submissions where AI evaluation failed, or a student asked for a second look.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('open')}
              className={`rounded-full px-4 py-2 text-[13.5px] font-semibold ${
                tab === 'open' ? 'bg-ink text-paper' : 'border border-stone-strong bg-paper text-ink'
              }`}
            >
              Needs attention ({open.length})
            </button>
            <button
              onClick={() => setTab('resolved')}
              className={`rounded-full px-4 py-2 text-[13.5px] font-semibold ${
                tab === 'resolved' ? 'bg-ink text-paper' : 'border border-stone-strong bg-paper text-ink'
              }`}
            >
              Resolved ({resolved.length})
            </button>
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-fail-ink">{error}</p>}

        <div className="mt-6 space-y-4">
          {list.map((item) => (
            <QueueCard
              key={item.id}
              item={item}
              onResolve={tab === 'open' ? (status, feedback) => resolve(item.id, status, feedback) : undefined}
            />
          ))}
          {list.length === 0 && (
            <div className="rounded-panel bg-panel p-10 text-center">
              <div className="ill-frame mx-auto aspect-[220/130] w-[220px] text-ink">
                <IllEmptyQueue />
              </div>
              <p className="mt-4 font-display text-lg font-bold text-ink">
                {tab === 'open' ? 'End of queue' : 'Nothing resolved yet'}
              </p>
              <p className="mt-1 text-[14.5px] text-muted">
                {tab === 'open' ? 'Nothing else needs attention right now.' : 'Resolved items will show up here.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
