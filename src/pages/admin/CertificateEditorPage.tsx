import { useEffect, useState } from 'react'
import AppNav from '@/components/layout/AppNav'
import AdminNav from '@/components/layout/AdminNav'
import CertificateCard from '@/components/certificate/CertificateCard'
import { Button } from '@/components/ui/Button'
import { Field, Label, TextAreaField, FieldHint } from '@/components/ui/Field'
import { CheckIcon } from '@/components/ui/icons'
import { FullPageSpinner } from '@/routes/ProtectedRoute'
import { useCertificateTemplate } from '@/hooks/useCertificateTemplate'

const SAMPLE = {
  student_name: 'Jamie Rivera',
  track_title: 'GTM Engineer Bootcamp',
  completion_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  certificate_code: 'SAMPLE1234',
}

function substitutePreview(template: string): string {
  return template
    .replaceAll('{{student_name}}', SAMPLE.student_name)
    .replaceAll('{{track_title}}', SAMPLE.track_title)
    .replaceAll('{{completion_date}}', SAMPLE.completion_date)
    .replaceAll('{{certificate_code}}', SAMPLE.certificate_code)
}

export default function CertificateEditorPage() {
  const { template, loading, error, createDefault, save } = useCertificateTemplate()
  const [form, setForm] = useState({
    title_text: '',
    body_text: '',
    signature_name: '',
    signature_title: '',
    logo_url: '',
    accent_color: '#1d4ed8',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (template) {
      setForm({
        title_text: template.title_text,
        body_text: template.body_text,
        signature_name: template.signature_name ?? '',
        signature_title: template.signature_title ?? '',
        logo_url: template.logo_url ?? '',
        accent_color: template.accent_color ?? '#1d4ed8',
      })
    }
  }, [template])

  async function handleSave() {
    setSaving(true)
    await save({
      title_text: form.title_text,
      body_text: form.body_text,
      signature_name: form.signature_name || null,
      signature_title: form.signature_title || null,
      logo_url: form.logo_url || null,
      accent_color: form.accent_color || null,
    })
    setSaving(false)
  }

  if (loading) return <FullPageSpinner />

  return (
    <div className="min-h-screen bg-ground">
      <AppNav />
      <AdminNav />
      <main className="mx-auto max-w-[1160px] px-4 py-10 sm:px-6">
        <h1 className="font-display text-[clamp(28px,5.2vw,44px)] uppercase leading-[0.94] tracking-[-0.02em] text-display">
          Certificate template
        </h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-muted">
          Structured fields only — merge fields are substituted into escaped text, so nothing you type here can
          become markup on the public certificate page.
        </p>

        {error && <p className="mt-4 text-sm font-bold text-danger-text">{error}</p>}

        {!template && !error && (
          <div className="mt-6 rounded-panel border border-dashed border-border-secondary p-8 text-center">
            <p className="text-[14.5px] text-muted">No active template yet.</p>
            <Button type="button" variant="primary" onClick={() => void createDefault()} className="mt-4">
              Create default template
            </Button>
          </div>
        )}

        {template && (
          <div className="mt-6 flex flex-wrap items-start gap-[clamp(16px,2.4vw,28px)]">
            <div className="min-w-[280px] flex-1 basis-[320px] rounded-panel border border-hairline p-7">
              <h2 className="mb-5 text-[19px] font-bold text-heading">Fields</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title_text">Title</Label>
                  <Field id="title_text" value={form.title_text} onChange={(e) => setForm({ ...form, title_text: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="body_text">Body</Label>
                  <TextAreaField id="body_text" value={form.body_text} onChange={(e) => setForm({ ...form, body_text: e.target.value })} rows={4} />
                  <FieldHint>
                    supports {'{{student_name}}'}, {'{{track_title}}'}, {'{{completion_date}}'}, {'{{certificate_code}}'}
                  </FieldHint>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signature_name">Signature name</Label>
                    <Field id="signature_name" value={form.signature_name} onChange={(e) => setForm({ ...form, signature_name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="signature_title">Signature title</Label>
                    <Field id="signature_title" value={form.signature_title} onChange={(e) => setForm({ ...form, signature_title: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Field id="logo_url" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="accent_color">Accent color</Label>
                    <input
                      id="accent_color"
                      type="color"
                      value={form.accent_color}
                      onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                      className="mt-0 h-11 w-full rounded-input border border-hairline bg-inset"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-input border border-hairline p-3.5">
                  <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-pass text-white">
                    <CheckIcon className="h-2.5 w-2.5" />
                  </span>
                  <span className="text-[12.5px] leading-relaxed text-body">
                    Renders as plain text — no rich formatting (XSS guard).
                  </span>
                </div>

                <Button type="button" variant="primary" onClick={() => void handleSave()} disabled={saving}>
                  {saving ? 'Saving…' : 'Save template'}
                </Button>
              </div>
            </div>

            <div className="min-w-[280px] flex-1 basis-[320px]">
              <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted">Live preview (sample data)</p>
              <CertificateCard
                fields={{
                  title_text: form.title_text,
                  body_text: substitutePreview(form.body_text),
                  signature_name: form.signature_name,
                  signature_title: form.signature_title,
                  logo_url: form.logo_url,
                  accent_color: form.accent_color,
                  student_name: SAMPLE.student_name,
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
