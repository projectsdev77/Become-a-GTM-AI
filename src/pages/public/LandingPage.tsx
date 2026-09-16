import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Illustration, { type IllustrationSlotId } from '@/components/ui/Illustration'

const TRACKS: { name: string; blurb: string; active: boolean; slot: IllustrationSlotId }[] = [
  {
    name: 'Self-paced',
    blurb: 'For operators fitting it around a full GTM workload.',
    active: false,
    slot: 'v4-t1',
  },
  {
    name: 'Cohort',
    blurb: 'Weekly deadlines, live reviews, a mentor on call.',
    active: true,
    slot: 'v4-t2',
  },
  {
    name: 'Team',
    blurb: 'For a whole RevOps team levelling up together.',
    active: false,
    slot: 'v4-t3',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />

      <main className="mx-auto max-w-[1160px] px-6">
        {/* hero */}
        <section className="relative pb-2 pt-16">
          <h1 className="max-w-[16ch] text-balance pr-[clamp(64px,10vw,116px)] font-display text-[clamp(34px,7vw,80px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
            <span className="text-accent">#</span>Become a GTM engineer, not just a GTM hire
          </h1>
          <span
            aria-hidden="true"
            className="absolute right-0 top-[clamp(2px,1.6vw,16px)] hidden h-[clamp(56px,7vw,84px)] w-[clamp(56px,7vw,84px)] items-center justify-center rounded-pill bg-accent text-[clamp(20px,2.6vw,28px)] text-on-accent sm:flex"
          >
            ↗
          </span>
        </section>

        <section className="flex flex-wrap items-end justify-between gap-6 py-9 pb-14">
          <div className="text-[13.5px] leading-[1.75] text-muted">
            With more than
            <br />
            <strong className="font-bold text-display">2K+ practitioners</strong>
            <br />
            <strong className="font-bold text-display">500+ lessons</strong>
          </div>
          <LinkButton to="/signup" variant="cta" className="shrink-0">
            Start week 1 free
          </LinkButton>
        </section>

        {/* three-up illustration gallery, centre frame deliberately taller */}
        <section className="flex flex-wrap items-center justify-center gap-5 pb-[66px]">
          <Illustration
            slot="v4-g1"
            loading="eager"
            className="flex-1 basis-[170px]"
            style={{ maxWidth: 250, aspectRatio: '3/4', borderRadius: 16 }}
          />
          <Illustration
            slot="v4-g2"
            loading="eager"
            className="flex-1 basis-[170px]"
            style={{ maxWidth: 250, aspectRatio: '3/4.7', borderRadius: 16 }}
          />
          <Illustration
            slot="v4-g3"
            loading="eager"
            className="flex-1 basis-[170px]"
            style={{ maxWidth: 250, aspectRatio: '3/4', borderRadius: 16 }}
          />
        </section>

        {/* outlined shell: the program */}
        <section className="mb-6 rounded-shell border border-hairline p-9">
          <div className="mb-7 flex flex-wrap justify-between gap-7">
            <h2 className="whitespace-nowrap font-body text-[clamp(20px,2.4vw,26px)] font-bold text-heading">
              Our tracks
            </h2>
            <p className="max-w-[420px] text-[14.5px] leading-[1.55] text-muted">
              Three ways through the same twelve weeks — pick the one that matches how much you can actually ship
              each week.
            </p>
          </div>

          <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
            {TRACKS.map((track) => (
              <Card key={track.name} active={track.active}>
                <div className="mb-2 pr-10 text-[18px] font-bold leading-[1.18]">
                  {track.name}
                  <br />
                  track
                </div>
                <p className="mb-4 text-[12.5px] leading-[1.5]">{track.blurb}</p>
                <Illustration
                  slot={track.slot}
                  loading="lazy"
                  className="w-full"
                  style={{ aspectRatio: '4/3', borderRadius: 10 }}
                />
              </Card>
            ))}
          </div>

          <div className="pb-1.5 pt-[clamp(30px,4vw,46px)] text-center">
            <p className="font-display text-[clamp(19px,3.4vw,36px)] uppercase leading-[1.1] text-display">
              Keep shipping until you
              <br />
              <span className="text-accent">find your own funnel</span>
            </p>
            <p className="mt-4 text-[13px] leading-[1.6] text-muted">
              Every week ends with something running in production.
              <br />
              Not a certificate — a thing that works.
            </p>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 px-2 pb-10 pt-1 text-[11.5px] font-semibold text-muted">
          <span>Copyright GTM Engineer Bootcamp</span>
          <span>Built for practitioners {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  )
}
