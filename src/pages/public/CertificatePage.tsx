import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import PublicNav from '@/components/layout/PublicNav'
import CertificateCard from '@/components/certificate/CertificateCard'
import Callout from '@/components/ui/Callout'
import { Button } from '@/components/ui/Button'
import Illustration from '@/components/ui/Illustration'
import { AlertIcon, CheckIcon } from '@/components/ui/icons'

interface CertificateSnapshot {
  title_text: string
  body_text: string
  signature_name: string | null
  signature_title: string | null
  logo_url: string | null
  accent_color: string | null
  student_name: string | null
}

export default function CertificatePage() {
  const { code } = useParams()
  const [snapshot, setSnapshot] = useState<CertificateSnapshot | null>(null)
  const [issuedAt, setIssuedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) return
    ;(async () => {
      const { data, error } = await supabase.rpc('get_certificate_by_code', { p_code: code })
      const row = Array.isArray(data) ? data[0] : data
      if (error || !row) {
        setNotFound(true)
      } else {
        setSnapshot(row.rendered_snapshot as CertificateSnapshot)
        setIssuedAt(row.issued_at as string)
      }
      setLoading(false)
    })()
  }, [code])

  async function handleShare() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ url, title: 'GTM Engineer Bootcamp certificate' })
        return
      }
    } catch {
      // user cancelled or share unsupported — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard unavailable — nothing more we can do without new plumbing
    }
  }

  return (
    <div className="min-h-screen bg-ground">
      <PublicNav />
      <main className="mx-auto max-w-[820px] px-4 py-16 sm:px-6">
        {loading && <p className="text-center font-mono text-xs font-bold uppercase tracking-wide text-muted">loading…</p>}

        {!loading && (
          <p className="mb-6 flex justify-center">
            {notFound ? (
              <span className="badge badge-alert">
                <AlertIcon className="h-3 w-3" /> invalid code · {code}
              </span>
            ) : (
              <span className="badge badge-pass">
                <CheckIcon className="h-3 w-3" /> verified certificate · code {code}
              </span>
            )}
          </p>
        )}

        {!loading && notFound && (
          <Callout tone="fail" heading="Certificate not found" icon={<AlertIcon className="h-3.5 w-3.5" />} className="mx-auto max-w-md text-center">
            No certificate matches this code. Double-check the link, or go home.
          </Callout>
        )}

        {!loading && snapshot && (
          <>
            <CertificateCard
              fields={snapshot}
              issuedAt={issuedAt ? new Date(issuedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null}
              code={code}
              illustration={
                <Illustration
                  slot="v4-cert"
                  loading="eager"
                  className="mb-[clamp(26px,3.6vw,40px)] w-full rounded-panel"
                  style={{ aspectRatio: '3/1' }}
                />
              }
            />
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button type="button" variant="cta" onClick={() => void handleShare()}>
                Share
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.print()}>
                Download PDF
              </Button>
              <p className="pl-2 font-mono text-[11px] text-muted">Plain-text rendering, no rich formatting</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
