import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import ListRow, { RowMeta, RowTitle } from '@/components/ui/ListRow'
import StatusPill from '@/components/ui/StatusPill'
import { supabase } from '@/lib/supabase'

interface PublicWeek {
  track_title: string
  week_position: number
  week_title: string
  week_goal: string | null
  week_summary: string | null
  estimated_hours: number | null
}

export default function CurriculumPage() {
  const [weeks, setWeeks] = useState<PublicWeek[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { hash } = useLocation()

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

  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(hash.slice(1))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />

      <main className="mx-auto max-w-[1160px] px-6 py-9">
        <div className="flex flex-wrap items-end justify-between gap-8 py-9">
          <h1 className="max-w-[16ch] font-display text-[clamp(30px,5vw,58px)] uppercase leading-none text-display">
            Twelve weeks, twelve things shipped
          </h1>
          <p className="max-w-[420px] text-[14.5px] leading-[1.65] text-muted">
            Published weeks are listed in full. The shape never changes: lessons, a resource set, one graded
            build — later weeks unlock as they're released.
          </p>
        </div>

        <div className="rounded-shell border border-hairline p-8">
          {loading && <p className="font-mono text-xs uppercase tracking-wide text-muted">loading…</p>}
          {error && <p className="text-sm font-bold text-danger-text">Couldn't load the curriculum: {error}</p>}

          {!loading && !error && (
            <>
              <div className="flex flex-col gap-3.5">
                {weeks.map((week) => {
                  // Week 1 is always the free intro week across the app
                  // (see Dashboard and Settings) — the RPC only ever returns
                  // published weeks, so every row here renders in full.
                  const isFree = week.week_position === 1
                  return (
                    <ListRow key={week.week_position} state="active">
                      <div className="min-w-0 flex-1 basis-[320px]">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-[11.5px] font-semibold tracking-[0.06em] text-label-on-cream">
                            WEEK {String(week.week_position).padStart(2, '0')}
                          </span>
                          {isFree && (
                            <StatusPill variant="pass" tone="cream">
                              Free
                            </StatusPill>
                          )}
                        </div>
                        <RowTitle>{week.week_title}</RowTitle>
                        {(week.week_goal || week.week_summary) && (
                          <RowMeta className="max-w-[52ch] font-body font-normal normal-case tracking-normal">
                            {week.week_goal ?? week.week_summary}
                          </RowMeta>
                        )}
                      </div>
                      {week.estimated_hours && <RowMeta className="shrink-0">~{week.estimated_hours} hrs</RowMeta>}
                    </ListRow>
                  )
                })}
                {weeks.length === 0 && (
                  <p className="font-mono text-xs uppercase tracking-wide text-muted">
                    Curriculum is being finalized — check back soon.
                  </p>
                )}
              </div>

              {weeks.length > 0 && (
                <div className="flex justify-center pt-8">
                  <LinkButton to="/signup" variant="cta">
                    Start week 1 free
                  </LinkButton>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
