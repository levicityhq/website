import { useEffect, useRef, useState } from 'react'
import { useResource, date } from './api'
import type { Api, Category, InvoiceDetail, Project } from './api'

const fields = [
  'vendor_name',
  'invoice_number',
  'invoice_date',
  'currency',
  'discount',
  'total',
] as const
export default function InvoicePanel({
  api,
  base,
  id,
  projects,
  close,
  saved,
}: {
  api: Api
  base: string
  id: string
  projects: Project[]
  close: () => void
  saved: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [version, setVersion] = useState(0)
  const detail = useResource<InvoiceDetail>(
    api,
    `${base}/invoices/${encodeURIComponent(id)}`,
    version,
  )
  const categories = useResource<Category[]>(api, `${base}/categories`)
  useEffect(() => {
    const el = dialog.current
    el?.showModal()
    return () => el?.close()
  }, [])
  return (
    <dialog
      ref={dialog}
      className="invoice-panel"
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
    >
      <div className="panel-inner">
        <header className="panel-header">
          <span className="eyebrow">INVOICE DETAILS</span>
          <button
            className="button"
            onClick={close}
            aria-label="Close invoice details"
          >
            ✕
          </button>
        </header>
        {detail.loading ? (
          <p role="status">Loading invoice…</p>
        ) : detail.error ? (
          <div className="error-box">
            <p role="alert">{detail.error}</p>
            <button className="button" onClick={() => setVersion((v) => v + 1)}>
              Try again
            </button>
          </div>
        ) : (
          detail.data && (
            <InvoiceEditor
              key={`${id}:${version}`}
              invoice={detail.data}
              api={api}
              base={base}
              projects={projects}
              categories={categories.data || []}
              categoryError={categories.error}
              saved={() => {
                setVersion((v) => v + 1)
                saved()
              }}
            />
          )
        )}
      </div>
    </dialog>
  )
}
function InvoiceEditor({
  invoice,
  api,
  base,
  projects,
  categories,
  categoryError,
  saved,
}: {
  invoice: InvoiceDetail
  api: Api
  base: string
  projects: Project[]
  categories: Category[]
  categoryError?: string
  saved: () => void
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f, String(invoice.fields[f] ?? '')])),
  )
  const [project, setProject] = useState(invoice.project?.id || '')
  const [category, setCategory] = useState(invoice.category?.code || '')
  const [rationale, setRationale] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [download, setDownload] = useState('')
  const path = `${base}/invoices/${encodeURIComponent(invoice.id)}`
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const changed = Object.fromEntries(
        fields
          .filter((f) => values[f] !== String(invoice.fields[f] ?? ''))
          .map((f) => [f, values[f] || null]),
      )
      if (Object.keys(changed).length)
        await api(`${path}/fields`, {
          method: 'PATCH',
          body: JSON.stringify(changed),
        })
      if (project !== (invoice.project?.id || ''))
        await api(`${path}/project`, {
          method: 'PUT',
          body: JSON.stringify({ project_id: project || null, rationale }),
        })
      if (category && category !== invoice.category?.code)
        await api(`${path}/category`, {
          method: 'PUT',
          body: JSON.stringify({ category_code: category, rationale }),
        })
      saved()
    } catch (e) {
      setMessage(
        `${(e as Error).message} Earlier changes may already have saved.`,
      )
    } finally {
      setBusy(false)
    }
  }
  async function source() {
    setBusy(true)
    setMessage('')
    try {
      const result = await api<{ url: string }>(`${path}/source-url`)
      if (new URL(result.url).protocol !== 'https:')
        throw new Error('The source download URL is invalid.')
      setDownload(result.url)
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <h2>{String(invoice.fields.vendor_name || 'Unknown vendor')}</h2>
      <p className="panel-subtitle">
        {invoice.filename} · Received {date(invoice.received_at)}
      </p>
      <span className="category-tag">{invoice.status}</span>
      <form onSubmit={submit}>
        <div className="panel-section">
          <h3>Invoice information</h3>
          <div className="field-grid">
            {fields.map((f) => (
              <label key={f}>
                {f.replaceAll('_', ' ')}
                <input
                  type={f === 'invoice_date' ? 'date' : 'text'}
                  inputMode={
                    f === 'total' || f === 'discount' ? 'decimal' : undefined
                  }
                  value={values[f]}
                  onChange={(e) =>
                    setValues({ ...values, [f]: e.target.value })
                  }
                />
              </label>
            ))}
          </div>
        </div>
        <div className="panel-section">
          <h3>Assignments</h3>
          <label>
            Project
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="">Unassigned</option>
              {invoice.project &&
                !projects.some((p) => p.id === invoice.project?.id) && (
                  <option value={invoice.project.id}>
                    {invoice.project.name} (archived)
                  </option>
                )}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Category
            <select
              value={category}
              disabled={!categories.length}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} / {c.display_name}
                </option>
              ))}
            </select>
          </label>
          {categoryError && (
            <p role="alert">
              Categories unavailable. Close and reopen this invoice to retry.
            </p>
          )}
          <label>
            Reason for assignment change
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Optional context for your team"
            />
          </label>
          <details>
            <summary>Assignment explanations</summary>
            {[invoice.project, invoice.category].map((a, i) => (
              <p key={i}>
                {i === 0 ? 'Project' : 'Category'}:{' '}
                {a?.rationale || 'No explanation available.'}{' '}
                {a?.confidence != null &&
                  `Confidence: ${Math.round(Number(a.confidence) * 100)}%`}
              </p>
            ))}
          </details>
        </div>
        <details className="panel-section">
          <summary>Extraction evidence & email</summary>
          <p>{invoice.email_subject || 'No email subject'}</p>
          <p>{invoice.email_sender || 'No sender available'}</p>
          {Object.entries(
            (invoice.fields.field_evidence as Record<string, string>) || {},
          ).map(([key, value]) => (
            <p key={key}>
              <strong>{key.replaceAll('_', ' ')}:</strong> {value}
            </p>
          ))}
        </details>
        {message && (
          <p className="error-box" role="alert">
            {message}
          </p>
        )}
        <div className="panel-actions">
          <button className="button primary" disabled={busy}>
            {busy ? 'Working…' : 'Save changes'}
          </button>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => void source()}
          >
            Get original document ↗
          </button>
        </div>
        {download && (
          <p>
            <a
              className="text-action"
              href={download}
              target="_blank"
              rel="noreferrer"
            >
              Download original (available for 15 minutes) ↗
            </a>
          </p>
        )}
      </form>
    </>
  )
}
