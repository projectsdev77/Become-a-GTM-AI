import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import { CheckIcon } from '@/components/ui/icons'
import { IllHero } from '@/components/ui/illustrations'

const STATS = ['12 weeks · self-paced', 'No cohort dates', 'AI feedback on every submission', 'A mentor one request away']

const WHY_ROWS = [
  {
    title: 'Sequenced, not scattered',
    body: 'Twelve weeks build on each other. You unlock week two by finishing week one — no picking a random tutorial and hoping it is the right next step.',
  },
  {
    title: 'Feedback on real work',
    body: 'Every assignment gets a response: AI-generated feedback the moment you submit, with a human mentor one request away if you want a second look.',
  },
  {
    title: 'Accountability without a cohort',
    body: 'No start dates, no deadlines, no late penalties. Progress is yours to make — the platform just makes sure you always know what is next.',
  },
]

const AUDIENCE = [
  'You already work in marketing, sales, or growth and want a structured path into AI-powered GTM specifically.',
  'You learn better with sequencing and checkpoints than with an open-ended pile of links.',
  'You want feedback on what you build — real prompts, campaigns, and outreach — not just a certificate for watching videos.',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />

      <main>
        {/* hero — editorial split, copy left, line-art slot right */}
        <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-[88px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">12 weeks · self-paced · no cohort dates</p>
              <h1 className="mt-4 font-display text-[44px] font-bold leading-[1.03] tracking-[-0.04em] text-ink sm:text-[52px]">
                Become a GTM AI
              </h1>
              <p className="mt-6 max-w-[40ch] text-[19px] leading-[1.6] text-body">
                A self-paced, 12-week path for marketing, sales, and growth professionals moving into AI-powered
                go-to-market. Curated resources, original framing, real assignments, and feedback on every
                submission.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <LinkButton to="/signup" variant="primary" shadow="app">
                  Start learning
                </LinkButton>
                <LinkButton to="/curriculum" variant="ghost">
                  View the curriculum
                </LinkButton>
              </div>
            </div>

            <div className="ill-frame aspect-[7/6] rounded-panel bg-panel text-ink">
              <IllHero />
            </div>
          </div>
        </section>

        {/* stat bar — the one place mono runs full-width: it's all figures */}
        <section className="border-y border-ink bg-ink">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
            {STATS.map((claim, i) => (
              <span key={claim} className={`font-mono text-[12px] font-semibold uppercase tracking-[0.06em] ${i === 0 ? 'text-signal-light' : 'text-paper/70'}`}>
                {claim}
              </span>
            ))}
          </div>
        </section>

        {/* why this works when a course doesn't — numbered rows, not cards */}
        <section className="mx-auto max-w-[1280px] px-4 py-[88px] sm:px-6">
          <p className="eyebrow">Why this works when a course doesn't</p>
          <div className="mt-6 border-t border-stone">
            {WHY_ROWS.map((row, i) => (
              <div
                key={row.title}
                className="grid gap-x-6 gap-y-2 border-b border-stone py-7 sm:grid-cols-[56px_1fr_1.15fr] sm:items-baseline"
              >
                <span className="font-mono text-[13px] font-semibold text-signal">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-2xl font-bold text-ink">{row.title}</h3>
                <p className="max-w-md text-[14.5px] leading-relaxed text-muted sm:justify-self-end sm:text-right">{row.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* is this for you */}
        <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <h2 className="font-display text-4xl font-bold text-ink">Is this for you?</h2>
              <p className="eyebrow mt-2">Three honest tests</p>
            </div>
            <ul className="border-t border-stone pt-3.5">
              {AUDIENCE.map((line) => (
                <li key={line} className="flex items-start gap-4 border-b border-stone py-5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-wash">
                    <CheckIcon className="h-4 w-4 text-signal-ink" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-ink">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* closing band */}
        <section className="border-t border-ink bg-ink">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-paper sm:text-4xl">Twelve weeks. One path. Start free.</h2>
              <p className="eyebrow mt-2">No card required · week one is open</p>
            </div>
            <LinkButton to="/signup" variant="primary" shadow="reverse" className="shrink-0">
              Create your account
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone py-8 text-center text-[12px] text-muted">
        © {new Date().getFullYear()} Become a GTM AI
      </footer>
    </div>
  )
}
