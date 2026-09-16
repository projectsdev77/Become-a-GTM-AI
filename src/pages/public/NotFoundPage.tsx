import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'
import Illustration from '@/components/ui/Illustration'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      {/* The site-wide `prefers-reduced-motion` rule in index.css caps every
          animation-duration to 0.01ms, so this blink is disabled for free
          under that media query — no separate override needed here. */}
      <style>{`
        @keyframes notfound-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .notfound-cursor { animation: notfound-cursor-blink 1s step-end infinite; }
      `}</style>
      <main className="mx-auto max-w-[680px] px-4 py-20 text-center sm:px-6">
        <h1
          className="mb-[clamp(24px,3.4vw,38px)] font-display uppercase leading-[.86] tracking-[-0.03em] text-display"
          style={{ fontSize: 'clamp(56px, 16vw, 150px)' }}
        >
          4<span className="text-accent">0</span>4
        </h1>

        <Illustration
          slot="v4-404"
          loading="eager"
          className="mb-[clamp(24px,3.2vw,34px)] w-full rounded-panel"
          style={{ aspectRatio: '2/1' }}
        />

        <div className="mb-[clamp(24px,3.2vw,34px)] overflow-x-auto rounded-panel border border-hairline bg-inset p-5 text-left font-mono text-[13px] leading-[1.85] text-code">
          <p>
            <span className="text-accent">$</span> cd /this/page
          </p>
          <p className="text-danger-text">bash: cd: /this/page: No such file or directory</p>
          <p>
            <span className="text-accent">$</span> cd /dashboard <span className="text-muted"># try this instead</span>
          </p>
          <p>
            <span className="text-accent">$</span> <span className="notfound-cursor text-display">▍</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton to="/dashboard" variant="cta">
            Back to dashboard
          </LinkButton>
          <LinkButton to="/curriculum" variant="secondary">
            Browse curriculum
          </LinkButton>
        </div>
      </main>
    </div>
  )
}
