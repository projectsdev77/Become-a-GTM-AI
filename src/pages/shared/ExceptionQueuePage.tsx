import { useState } from 'react'
import AppNav from '@/components/layout/AppNav'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import QueueCard from '@/components/queue/QueueCard'
import IllustrationSlot from '@/components/ui/IllustrationSlot'

// Mentor-only (see App.tsx): admins no longer evaluate submissions, so
// there is no admin route into this page and no mentor-reassignment
// affordance here — that lived in the admin variant, removed with it.
export default function ExceptionQueuePage() {
  const { open, resolved, loading, error, resolve } = useExceptionQueue()
  const [tab, setTab] = useState<'open' | 'resolved'>('open')

  if (loading) return <FullPageSpinner />

  const list = tab === 'open' ? open : resolved

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-6">
          <h1 className="font-display text-[clamp(24px,3.2vw,34px)] uppercase text-text">Exception queue</h1>
          <p className="max-w-[380px] text-[13.5px] text-text-muted">
            Grading failures and student-flagged reviews land here. Clear them in order.
          </p>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={() => setTab('open')}
            className={`rounded-pill px-[18px] py-2 text-[13px] font-bold ${
              tab === 'open' ? 'bg-card-light text-on-light' : 'border border-line text-text-body hover:border-line-strong'
            }`}
          >
            Needs attention ({open.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('resolved')}
            className={`rounded-pill px-[18px] py-2 text-[13px] font-bold ${
              tab === 'resolved' ? 'bg-card-light text-on-light' : 'border border-line text-text-body hover:border-line-strong'
            }`}
          >
            Resolved ({resolved.length})
          </button>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-fail-text">{error}</p>}

        <div className="mt-6 rounded-panel border border-line p-6">
          {list.length > 0 ? (
            <div className="flex flex-col gap-3">
              {list.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  onResolve={tab === 'open' ? (status, feedback) => resolve(item.id, status, feedback) : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <IllustrationSlot ratio="1/1" className="mx-auto w-[180px] rounded-panel" />
              <p className="mt-6 font-display text-xl uppercase text-text">
                {tab === 'open' ? "Queue's clear" : 'Nothing resolved yet'}
              </p>
              <p className="mt-2 text-sm text-text-muted">
                {tab === 'open' ? 'Nothing needs a human right now.' : 'Resolved items will show up here.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
