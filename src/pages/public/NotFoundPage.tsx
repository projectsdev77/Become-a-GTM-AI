import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'

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
      <main className="mx-auto max-w-[720px] px-4 py-20 text-center sm:px-6">
        <h1
          className="font-display uppercase leading-[.92] text-text"
          style={{ fontSize: 'clamp(40px, 9vw, 104px)' }}
        >
          4<span className="text-primary">0</span>4
        </h1>

        <div className="mb-7 overflow-x-auto rounded-field border border-line bg-ground-deep p-5 text-left font-mono text-[13px] leading-[1.8] text-[color:var(--color-code-body)]">
          <p>
            <span className="text-primary">$</span> cd /this/page
          </p>
          <p className="text-fail-text">bash: cd: /this/page: No such file or directory</p>
          <p>
            <span className="text-primary">$</span> cd /dashboard <span className="text-text-muted"># try this instead</span>
          </p>
          <p>
            <span className="text-primary">$</span> <span className="notfound-cursor text-text">▍</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton to="/dashboard" variant="site">
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
