import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
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
          <h1 className="max-w-[16ch] font-display text-[clamp(30px,5vw,58px)] uppercase leading-none text-text">
            Twelve weeks, twelve things shipped
          </h1>
          <p className="max-w-[380px] text-[14.5px] leading-[1.65] text-text-muted">
            Published weeks are listed in full. Later weeks unlock as they're released — the shape of each is
            fixed: lessons, resources, one graded assignment.
          </p>
        </div>

        <div className="rounded-shell border border-line p-8">
          {loading && <p className="font-mono text-xs uppercase tracking-wide text-text-muted">loading…</p>}
          {error && <p className="text-sm font-bold text-fail-text">Couldn't load the curriculum: {error}</p>}

          {!loading && !error && (
            <>
              <div className="flex flex-col gap-3">
                {weeks.map((week) => (
                  <div key={week.week_position} className="flex flex-wrap justify-between gap-6 rounded-chip bg-card-light p-6">
                    <div className="min-w-0 flex-1 basis-[360px]">
                      <p className="mb-2 font-mono text-[10.5px] text-on-light-meta">
                        WEEK {String(week.week_position).padStart(2, '0')}
                      </p>
                      <h2 className="mb-2 font-display text-[19px] uppercase text-on-light">{week.week_title}</h2>
                      {(week.week_goal || week.week_summary) && (
                        <p className="text-[13px] leading-[1.55] text-on-light-mute">{week.week_goal ?? week.week_summary}</p>
                      )}
                    </div>
                    {week.estimated_hours && (
                      <div className="shrink-0 basis-[200px] font-mono text-[12.5px] text-on-light-mute">
                        ~{week.estimated_hours} hrs
                      </div>
                    )}
                  </div>
                ))}
                {weeks.length === 0 && (
                  <p className="font-mono text-xs uppercase tracking-wide text-text-muted">
                    Curriculum is being finalized — check back soon.
                  </p>
                )}
              </div>

              {weeks.length > 0 && (
                <div className="flex justify-center pt-8">
                  <LinkButton to="/signup" variant="site">
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
