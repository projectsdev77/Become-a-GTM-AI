import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'

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
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'mentor'),
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
  to,
  warn,
}: {
  label: string
  value: string
  to: string
  warn?: boolean
}) {
  return (
    <Link
      to={to}
      className={`block rounded-panel p-5 no-underline ${warn ? 'border border-fail-border' : 'card'}`}
      style={warn ? { background: 'rgba(196,85,60,.12)' } : undefined}
    >
      <p className={`font-display text-[34px] leading-none ${warn ? 'text-fail-text' : 'text-on-light'}`}>{value}</p>
      <p
        className={`meta mt-2 ${warn ? 'text-fail-text' : 'text-on-light-meta'}`}
      >
        {label}
      </p>
    </Link>
  )
}

export default function AdminDashboardPage() {
  const stats = useAdminStats()

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <p className="meta text-primary">[ system overview ]</p>
        <h1 className="mt-2 font-display text-[clamp(24px,3.2vw,34px)] uppercase leading-[1.05] text-text">
          Admin overview
        </h1>

        {stats && (
          <div className="mt-7 rounded-shell border border-line p-6">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Active students" value={String(stats.students)} to="/admin/students" />
              <StatTile label="Mentors" value={String(stats.mentors)} to="/admin/mentors" />
              <StatTile
                label="Published / draft weeks"
                value={`${stats.weeksPublished} / ${stats.weeksDraft}`}
                to="/admin/curriculum"
              />
              <StatTile
                label="Broken links"
                value={String(stats.brokenLinks)}
                to="/admin/broken-links"
                warn={stats.brokenLinks > 0}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
