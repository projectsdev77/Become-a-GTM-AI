import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Illustration, { type IllustrationSlotId } from '@/components/ui/Illustration'

const HOW_IT_WORKS: { name: string; blurb: string; active: boolean; slot: IllustrationSlotId }[] = [
  {
    name: 'Learn on your own time',
    blurb: 'Twelve weeks that build on each other — finish week one to unlock week two. No cohort schedule, no deadlines.',
    active: false,
    slot: 'v4-t1',
  },
  {
    name: 'Ship, then get real feedback',
    blurb: 'Every assignment is graded the moment you submit — a pass, a needs-work, with specifics either way.',
    active: true,
    slot: 'v4-t2',
  },
  {
    name: 'Never stuck alone',
    blurb: "If the feedback isn't enough, escalate to a real mentor who reviews your submission.",
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
            One self-paced track.
            <br />
            <strong className="font-bold text-display">12 weeks, AI-graded</strong>
            <br />
            <strong className="font-bold text-display">Real mentors when you're stuck</strong>
          </div>
          <LinkButton to="/signup" variant="cta" className="shrink-0">
            Start week 1 free
          </LinkButton>
        </section>

        {/* claim strip — every one of these is a real, checkable product fact, not marketing filler */}
        <section className="flex flex-wrap items-center gap-x-8 gap-y-2 border-y border-hairline py-4">
          {['No start dates', 'No deadlines', 'No late penalties', 'Feedback on every submission'].map((claim, i) => (
            <span
              key={claim}
              className={`font-mono text-[11px] font-bold uppercase tracking-[0.1em] ${i === 0 ? 'text-accent' : 'text-muted'}`}
            >
              {claim}
            </span>
          ))}
        </section>

        {/* three-up illustration gallery, centre frame deliberately taller */}
        <section className="flex flex-wrap items-center justify-center gap-5 pb-[66px] pt-[46px]">
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
              How it works
            </h2>
            <p className="max-w-[420px] text-[14.5px] leading-[1.55] text-muted">
              The same loop every week: learn, ship an assignment, get feedback — from the grader first, from a
              mentor if you need it.
            </p>
          </div>

          <div className="grid gap-[18px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))' }}>
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.name} active={step.active}>
                <div className="mb-2 pr-10 text-[18px] font-bold leading-[1.18]">{step.name}</div>
                <p className="mb-4 text-[12.5px] leading-[1.5]">{step.blurb}</p>
                <Illustration
                  slot={step.slot}
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
