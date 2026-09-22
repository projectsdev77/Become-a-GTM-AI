import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import Card from '@/components/ui/Card'

interface Stats {
  students: number
  mentors: number
  weeksPublished: number
  weeksDraft: number
  brokenLinks: number
}

function useAdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    ;(async () => {
      const [students, mentors, weeksPublished, weeksDraft, brokenLinks] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor').eq('status', 'active'),
        supabase.from('weeks').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('weeks').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('is_broken', true),
      ])
      setStats({
        students: students.count ?? 0,
        mentors: mentors.count ?? 0,
        weeksPublished: weeksPublished.count ?? 0,
        weeksDraft: weeksDraft.count ?? 0,
        brokenLinks: brokenLinks.count ?? 0,
      })
    })()
  }, [])

  return stats
}

function StatTile({
  label,
  value,
  meta,
  to,
  warn,
}: {
  label: string
  value: string
  meta?: string
  to: string
  warn?: boolean
}) {
  return (
    <Link to={to} className="block no-underline">
      <Card active={warn} className="p-[22px]">
        <p className="font-display text-[clamp(30px,4vw,42px)] leading-none">{value}</p>
        <p className={`mt-2.5 text-[11.5px] font-bold uppercase tracking-[0.06em] ${warn ? '' : 'text-label-on-cream'}`}>
          {label}
        </p>
        {meta && <p className={`mt-1.5 text-[12.5px] font-semibold ${warn ? '' : 'text-ink-2-on-cream'}`}>{meta}</p>}
      </Card>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const stats = useAdminStats()
  const totalWeeks = stats ? stats.weeksPublished + stats.weeksDraft : 0

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-[clamp(28px,5.6vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          Overview
        </h1>

        {stats && (
          <div className="mt-7 rounded-shell border border-hairline p-6">
            <div className="grid grid-cols-1 gap-[clamp(12px,1.6vw,18px)] sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Students" value={String(stats.students)} to="/admin/students" />
              <StatTile label="Mentors" value={String(stats.mentors)} to="/admin/mentors" />
              <StatTile
                label="Weeks published"
                value={`${stats.weeksPublished}/${totalWeeks || stats.weeksPublished}`}
                meta={`${stats.weeksDraft} in draft`}
                to="/admin/curriculum"
              />
              <StatTile
                label="Broken links"
                value={String(stats.brokenLinks)}
                meta="Found by today's check"
                to="/admin/broken-links"
                warn={stats.brokenLinks > 0}
              />
            </div>

            <div className="py-[clamp(28px,3.6vw,44px)] pb-1.5 text-center">
              <p className="font-display text-[clamp(18px,3vw,32px)] uppercase leading-[1.1] text-display">
                {stats.weeksPublished} week{stats.weeksPublished === 1 ? '' : 's'} live.{' '}
                <span className="text-accent">
                  {stats.weeksDraft} to write.
                </span>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
