import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import IllustrationSlot from '@/components/ui/IllustrationSlot'

const TRACKS = [
  {
    name: 'Self-paced',
    blurb: 'For operators fitting it around a full GTM workload.',
    active: false,
  },
  {
    name: 'Cohort',
    blurb: 'Weekly deadlines, live reviews, a mentor on call.',
    active: true,
  },
  {
    name: 'Team',
    blurb: 'For a whole RevOps team levelling up together.',
    active: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />

      <main className="mx-auto max-w-[1160px] px-6">
        {/* hero */}
        <section className="pb-2 pt-16">
          <h1 className="max-w-[14ch] text-balance font-display text-[clamp(34px,6.2vw,72px)] uppercase leading-[0.98] tracking-[-0.01em] text-text">
            <span className="text-primary">#</span>Become a GTM engineer
          </h1>
          <p className="mt-7 max-w-[430px] text-[15px] leading-[1.65] text-text-muted">
            A 12-week, self-paced program that turns RevOps and GTM practitioners into builders — real
            assignments, AI feedback on submit, a mentor when you want one.
          </p>
        </section>

        <section className="flex flex-wrap items-end justify-between gap-6 py-9 pb-14">
          <div className="text-[13px] leading-[1.7] text-text-muted">
            With more than
            <br />
            <strong className="font-bold text-text">2K+ members</strong>
            <br />
            <strong className="font-bold text-text">500+ lessons</strong>
          </div>
          <LinkButton to="/signup" variant="site" className="shrink-0">
            Start week 1 free
          </LinkButton>
        </section>

        {/* three-up illustration gallery, centre frame deliberately taller */}
        <section className="flex flex-wrap items-center justify-center gap-5 pb-[72px]">
          <IllustrationSlot ratio="3/4" className="max-w-[300px] flex-1 basis-[240px]" />
          <IllustrationSlot ratio="3/4.6" className="max-w-[300px] flex-1 basis-[240px]" />
          <IllustrationSlot ratio="3/4" className="max-w-[300px] flex-1 basis-[240px]" />
        </section>

        {/* outlined shell: the program */}
        <section className="mb-6 rounded-shell border border-line p-9">
          <div className="mb-7 flex flex-wrap justify-between gap-7">
            <h2 className="font-body text-[22px] font-bold text-text-bright">The program</h2>
            <p className="max-w-[420px] text-[14.5px] leading-[1.55] text-text-muted">
              Three tracks through the same 12 weeks — pick the pace that matches how much you can actually
              ship each week.
            </p>
          </div>

          <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))' }}>
            {TRACKS.map((track) => (
              <div key={track.name} className={`rounded-chip p-5 ${track.active ? 'bg-primary' : 'bg-card-light'}`}>
                <div className="mb-3.5 flex items-start justify-between gap-3">
                  <div className={`text-[17px] font-bold leading-[1.2] ${track.active ? 'text-white' : 'text-on-light'}`}>
                    {track.name}
                    <br />
                    track
                  </div>
                  <span
                    className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[15px] ${
                      track.active ? 'bg-ground-ink text-white' : 'bg-primary text-white'
                    }`}
                  >
                    ↗
                  </span>
                </div>
                <p className={`mb-4 text-[12.5px] leading-[1.5] ${track.active ? 'text-primary-tint' : 'text-on-light-mute'}`}>
                  {track.blurb}
                </p>
                <IllustrationSlot ratio="4/3" className="w-full" />
              </div>
            ))}
          </div>

          <div className="pb-2 pt-10 text-center">
            <p className="font-display text-[clamp(20px,3.4vw,32px)] uppercase leading-[1.18] text-text">
              Keep shipping until you <span className="text-primary">find your funnel</span>
            </p>
            <p className="mt-3.5 text-[13px] leading-[1.6] text-text-muted">
              Every week ends with something running in production.
            </p>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 px-2 pb-10 pt-1 font-mono text-[11px] text-text-muted">
          <span>© {new Date().getFullYear()} GTM Engineer Bootcamp</span>
          <span>Built for practitioners</span>
        </footer>
      </main>
    </div>
  )
}
