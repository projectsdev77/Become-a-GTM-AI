import { useState } from 'react'
import AppNav from '@/components/layout/AppNav'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useExceptionQueue } from '@/hooks/useExceptionQueue'
import QueueCard from '@/components/queue/QueueCard'
import Illustration from '@/components/ui/Illustration'

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
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-hairline pb-6">
          <h1 className="font-display text-[clamp(28px,5.6vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
            Exception queue
          </h1>
          <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted">
            Grading failures and student-flagged reviews. Clear these first — a student is waiting on every row.
          </p>
        </div>

        <div className="mt-6 flex gap-2.5">
          <button
            type="button"
            onClick={() => setTab('open')}
            className={`flex min-h-11 items-center whitespace-nowrap rounded-pill px-[18px] py-2 text-[13px] font-bold ${
              tab === 'open' ? 'bg-cream text-ink-on-cream' : 'border border-border-secondary text-body hover:border-muted'
            }`}
          >
            Needs attention ({open.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('resolved')}
            className={`flex min-h-11 items-center whitespace-nowrap rounded-pill px-[18px] py-2 text-[13px] font-bold ${
              tab === 'resolved' ? 'bg-cream text-ink-on-cream' : 'border border-border-secondary text-body hover:border-muted'
            }`}
          >
            Resolved ({resolved.length})
          </button>
        </div>

        {error && <p className="mt-4 text-sm font-bold text-danger-text">{error}</p>}

        <div className="mt-6">
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
            <div className="rounded-panel border border-hairline py-[clamp(28px,4vw,48px)] text-center">
              <Illustration
                slot="v4-queue-empty"
                className="mx-auto mb-[26px] rounded-panel"
                style={{ width: 'min(200px,50vw)', aspectRatio: '1/1' }}
              />
              <p className="mb-3 font-display text-[clamp(19px,3vw,30px)] uppercase leading-[1.1] text-display">
                {tab === 'open' ? (
                  <>
                    Queue is <span className="text-accent">clear</span>
                  </>
                ) : (
                  'Nothing resolved yet'
                )}
              </p>
              <p className="mx-auto max-w-[40ch] text-[14px] leading-relaxed text-muted">
                {tab === 'open'
                  ? "No failed grades, no flagged reviews. We'll email you when something lands here."
                  : 'Resolved items will show up here.'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
