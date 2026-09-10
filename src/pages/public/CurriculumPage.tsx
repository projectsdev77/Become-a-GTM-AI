import { useEffect, useState } from 'react'
import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'

interface PublicWeek {
  track_title: string
  week_position: number
  week_title: string
  week_status: 'draft' | 'published'
  week_goal: string | null
  week_summary: string | null
  estimated_hours: number | null
  assignment_type: 'quiz' | 'text' | 'url' | null
}

const TYPE_LABEL: Record<string, string> = { quiz: 'Quiz', text: 'Text', url: 'URL' }

export default function CurriculumPage() {
  const [weeks, setWeeks] = useState<PublicWeek[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .rpc('public_curriculum_overview')
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setError(error.message)
        } else {
          setWeeks((data ?? []) as PublicWeek[])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const publishedCount = weeks.filter((w) => w.week_status === 'published').length
  const totalHours = weeks.reduce((sum, w) => sum + (w.estimated_hours ?? 0), 0)
  const visibleWeeks = weeks.slice(0, 5)
  const collapsedWeeks = weeks.slice(5)

  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main className="mx-auto max-w-[1000px] px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">The full path</p>
            <h1 className="mt-3 font-display text-[38px] font-bold leading-[1.06] tracking-[-0.035em] text-ink sm:text-[44px]">
              The curriculum
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-body">
              Twelve weeks, self-paced. Each week unlocks once you finish the one before it.
            </p>
          </div>
          {weeks.length > 0 && (
            <div className="flex shrink-0 gap-3">
              <div className="card">
                <p className="font-display text-2xl font-bold text-ink">{weeks.length}</p>
                <p className="meta mt-1">Weeks</p>
              </div>
              <div className="card">
                <p className="font-display text-2xl font-bold text-ink">~{Math.round(totalHours)}</p>
                <p className="meta mt-1">Est. hours</p>
              </div>
            </div>
          )}
        </div>

        {loading && <p className="mt-10 text-[13px] text-muted">loading…</p>}
        {error && <p className="mt-10 text-sm font-bold text-fail-ink">Couldn't load the curriculum: {error}</p>}

        {!loading && !error && weeks.length > 0 && (
          <div className="mt-10 overflow-x-auto rounded-card border border-stone">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b-[1.5px] border-ink">
                  <th className="w-14 px-4 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">#</th>
                  <th className="px-4 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Week</th>
                  <th className="w-28 px-4 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Assignment</th>
                  <th className="w-16 px-4 py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone">
                {visibleWeeks.map((week) => {
                  const scaffolded = week.week_status !== 'published'
                  return (
                    <tr key={week.week_position} className={scaffolded ? 'opacity-[0.62]' : ''}>
                      <td className="px-4 py-4 font-mono text-[13px] text-muted">{String(week.week_position).padStart(2, '0')}</td>
                      <td className="px-4 py-4">
                        <p className={`text-[19px] font-bold ${scaffolded ? 'text-muted' : 'text-ink'}`}>{week.week_title}</p>
                        {week.week_goal && <p className="mt-1 text-[15px] text-muted">{week.week_goal}</p>}
                      </td>
                      <td className="px-4 py-4">
                        {week.assignment_type ? (
                          <span className="pill pill-active">{TYPE_LABEL[week.assignment_type]}</span>
                        ) : (
                          <span className="pill pill-locked">TBC</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-[13px] text-muted">
                        {week.estimated_hours ? week.estimated_hours : '—'}
                      </td>
                    </tr>
                  )
                })}
                {collapsedWeeks.length > 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center font-mono text-[12px] text-muted">
                      + {collapsedWeeks.length} more weeks, scaffolded and on the way
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && weeks.length === 0 && (
          <p className="mt-10 text-[13px] text-muted">Curriculum is being finalized — check back soon.</p>
        )}

        <div className="mt-14 rounded-panel bg-ink px-8 py-10 text-center">
          <p className="text-[13.5px] text-paper/70">{publishedCount} of {weeks.length || 12} weeks are live today — the rest unlock as they publish.</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-paper">Ready to start week one?</h2>
          <LinkButton to="/signup" variant="primary" shadow="reverse" className="mt-6">
            Start week one
          </LinkButton>
        </div>
      </main>
    </div>
  )
}
