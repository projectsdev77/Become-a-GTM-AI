export interface CertificateFields {
  title_text: string
  body_text: string
  signature_name?: string | null
  signature_title?: string | null
  logo_url?: string | null
  accent_color?: string | null
}

// Renders every field as plain JSX text content (never dangerouslySetInnerHTML).
// PD-011: an admin-editable HTML blob on a public page would be a stored XSS
// vector, and body_text can carry a student-supplied name via the
// {{student_name}} merge field — React's default text-node escaping is what
// actually keeps this safe, not any sanitization step, so that property must
// never be relaxed here.
export default function CertificateCard({
  fields,
  issuedAt,
  code,
}: {
  fields: CertificateFields
  /** Formatted issue date for the ISSUED cell; omitted (e.g. admin preview) shows a dash. */
  issuedAt?: string | null
  /** Verification code for the CODE cell; omitted (e.g. admin preview) shows a dash. */
  code?: string | null
}) {
  return (
    <div className="rounded-shell bg-card-light px-7 py-[clamp(28px,5vw,56px)] text-center sm:px-[clamp(28px,5vw,56px)]">
      <div className="mb-9 flex items-center justify-center gap-[9px]">
        {fields.logo_url ? (
          <img src={fields.logo_url} alt="" className="h-6 object-contain" />
        ) : (
          <>
            <span
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-logo font-display text-[13px] font-bold"
              style={{ background: 'var(--color-on-light)', color: 'var(--color-card-light)' }}
            >
              G
            </span>
            <span className="font-display text-sm uppercase leading-none tracking-[0.02em] text-on-light">
              GTM Engineer Bootcamp
            </span>
          </>
        )}
      </div>

      <p className="mb-[22px] font-mono text-[11px] uppercase tracking-[0.14em] text-on-light-meta">
        Certificate of completion
      </p>

      <h1 className="mb-[22px] font-display text-[clamp(26px,4.4vw,44px)] uppercase leading-[1.05] text-on-light">
        {fields.title_text}
      </h1>

      <p className="mx-auto mb-8 max-w-[460px] text-[14.5px] leading-relaxed text-on-light-mute">{fields.body_text}</p>

      <div
        className="flex flex-wrap justify-center gap-x-[clamp(20px,6vw,64px)] gap-y-4 pt-6"
        style={{ borderTop: '1px solid rgba(34,31,27,.18)' }}
      >
        <div>
          <p className="mb-[5px] font-mono text-[10.5px] text-on-light-meta">ISSUED</p>
          <p className="text-[13.5px] font-bold text-on-light">{issuedAt || '—'}</p>
        </div>
        <div>
          <p className="mb-[5px] font-mono text-[10.5px] text-on-light-meta">CODE</p>
          <p className="font-mono text-[13.5px] font-medium text-on-light">{code || '—'}</p>
        </div>
        {(fields.signature_name || fields.signature_title) && (
          <div>
            <p className="mb-[5px] font-mono text-[10.5px] text-on-light-meta">SIGNED</p>
            <p className="text-[13.5px] font-bold text-on-light">{fields.signature_name || fields.signature_title}</p>
          </div>
        )}
      </div>
    </div>
  )
}
