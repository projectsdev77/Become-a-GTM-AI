import type { CSSProperties, ReactNode } from 'react'

export interface CertificateFields {
  title_text: string
  body_text: string
  signature_name?: string | null
  signature_title?: string | null
  logo_url?: string | null
  accent_color?: string | null
  /** Raw recipient name, stored separately in rendered_snapshot alongside
   * the already-substituted body_text — lets the name get its own line and
   * typographic emphasis without parsing markup out of admin-authored text. */
  student_name?: string | null
}

// Renders every field as plain JSX text content (never dangerouslySetInnerHTML).
// PD-011: an admin-editable HTML blob on a public page would be a stored XSS
// vector, and body_text can carry a student-supplied name via the
// {{student_name}} merge field — React's default text-node escaping is what
// actually keeps this safe, not any sanitization step, so that property must
// never be relaxed here. Splitting body_text on student_name below is a
// plain string slice, not markup parsing — every piece still renders as an
// escaped text node.
function splitBodyOnName(bodyText: string, studentName?: string | null) {
  if (!studentName) return null
  const idx = bodyText.indexOf(studentName)
  if (idx === -1) return null
  return {
    before: bodyText.slice(0, idx).trim(),
    after: bodyText.slice(idx + studentName.length).trim(),
  }
}

export default function CertificateCard({
  fields,
  issuedAt,
  code,
  illustration,
}: {
  fields: CertificateFields
  /** Formatted issue date for the ISSUED cell; omitted (e.g. admin preview) shows a dash. */
  issuedAt?: string | null
  /** Verification code for the CODE cell; omitted (e.g. admin preview) shows a dash. */
  code?: string | null
  /** Optional illustration band rendered above the logo lockup (public certificate page only). */
  illustration?: ReactNode
}) {
  // Falls back to the site's own amber for certificates issued before this
  // field existed (rendered_snapshot is frozen at issue time, so an old
  // snapshot's accent_color can be missing even after a template update).
  const accent = fields.accent_color || 'var(--color-accent)'
  const cornerSize = 'clamp(30px, 6vw, 50px)'
  const textureSize = 'clamp(46px, 8vw, 76px)'
  const nameSplit = splitBodyOnName(fields.body_text, fields.student_name)

  return (
    <div
      className="relative overflow-hidden rounded-card px-7 py-[clamp(28px,4vw,46px)] text-center text-ink-on-cream sm:px-[clamp(32px,5.6vw,60px)]"
      style={{ '--cert-accent': accent, background: 'var(--color-heading)' } as CSSProperties}
    >
      <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: 'var(--cert-accent)' }} aria-hidden="true" />

      {/* solid corner marks — top-left / bottom-right */}
      <span
        className="absolute left-0 top-0"
        style={{
          width: cornerSize,
          height: cornerSize,
          background: 'var(--cert-accent)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          opacity: 0.9,
        }}
        aria-hidden="true"
      />
      <span
        className="absolute bottom-0 right-0"
        style={{
          width: cornerSize,
          height: cornerSize,
          background: 'var(--cert-accent)',
          clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
          opacity: 0.9,
        }}
        aria-hidden="true"
      />

      {/* dot-grid texture — top-right */}
      <span
        className="absolute right-0 top-0"
        style={{
          width: textureSize,
          height: textureSize,
          backgroundImage: 'radial-gradient(var(--cert-accent) 1.3px, transparent 1.3px)',
          backgroundSize: '9px 9px',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      {/* diagonal stripe texture — bottom-left */}
      <span
        className="absolute bottom-0 left-0"
        style={{
          width: textureSize,
          height: textureSize,
          backgroundImage: 'repeating-linear-gradient(45deg, var(--cert-accent) 0 3px, transparent 3px 10px)',
          clipPath: 'polygon(0 30%, 70% 100%, 0 100%)',
          opacity: 0.4,
        }}
        aria-hidden="true"
      />

      {illustration}
      <div className="mb-9 flex items-center justify-center gap-[9px]">
        {fields.logo_url ? (
          <img src={fields.logo_url} alt="" className="h-6 object-contain" />
        ) : (
          <>
            <span
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-chip font-display text-[13px] font-bold"
              style={{ background: 'var(--cert-accent)', color: '#fff' }}
            >
              G
            </span>
            <span className="font-display text-sm uppercase leading-none tracking-[0.02em] text-ink-on-cream">
              GTM Engineer Bootcamp
            </span>
          </>
        )}
      </div>

      <p
        className="mb-[22px] font-mono text-[11px] font-bold uppercase tracking-[0.14em]"
        style={{ color: 'var(--cert-accent)' }}
      >
        Certificate of completion
      </p>

      <h1 className="mb-[26px] font-display text-[clamp(26px,4.4vw,44px)] uppercase leading-[1.05] tracking-[-0.02em] text-ink-on-cream">
        {fields.title_text}
      </h1>

      {nameSplit ? (
        <>
          {nameSplit.before && (
            <p className="mb-2.5 text-[12.5px] uppercase tracking-[0.1em] text-label-on-cream">{nameSplit.before}</p>
          )}
          <p className="mb-4 font-name text-[clamp(30px,5.6vw,54px)] italic leading-tight text-ink-on-cream">
            {fields.student_name}
          </p>
          {nameSplit.after && (
            <p className="mx-auto mb-8 max-w-[460px] text-[14.5px] leading-relaxed text-ink-2-on-cream">{nameSplit.after}</p>
          )}
        </>
      ) : (
        <p className="mx-auto mb-8 max-w-[460px] text-[14.5px] leading-relaxed text-ink-2-on-cream">{fields.body_text}</p>
      )}

      <div
        className="flex flex-wrap justify-center gap-x-[clamp(20px,6vw,64px)] gap-y-4 pt-6"
        style={{ borderTop: '1px solid var(--color-cream-rule)' }}
      >
        <div>
          <p className="mb-[5px] text-[11px] font-bold uppercase tracking-[0.06em] text-label-on-cream">ISSUED</p>
          <p className="text-[13.5px] font-bold text-ink-on-cream">{issuedAt || '—'}</p>
        </div>
        <div>
          <p className="mb-[5px] text-[11px] font-bold uppercase tracking-[0.06em] text-label-on-cream">CODE</p>
          <p className="font-mono text-[13.5px] font-medium text-ink-on-cream">{code || '—'}</p>
        </div>
        {(fields.signature_name || fields.signature_title) && (
          <div>
            <p className="mb-[5px] text-[11px] font-bold uppercase tracking-[0.06em] text-label-on-cream">SIGNED</p>
            <p className="text-[13.5px] font-bold text-ink-on-cream">{fields.signature_name || fields.signature_title}</p>
          </div>
        )}
      </div>
    </div>
  )
}
