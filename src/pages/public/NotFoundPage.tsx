import PublicNav from '@/components/layout/PublicNav'
import { LinkButton } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-paper">
      <PublicNav />
      <main className="mx-auto max-w-[560px] px-4 py-24 text-center sm:px-6">
        <p className="font-display text-[88px] font-bold leading-none text-ink">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">This page doesn't exist</h1>
        <p className="mx-auto mt-3 max-w-md text-[16px] leading-relaxed text-muted">
          It moved somewhere we haven't linked, or never existed. Nothing you did broke anything.
        </p>
        <LinkButton to="/" variant="secondary" className="mt-8">
          Go home
        </LinkButton>
      </main>
    </div>
  )
}
