import { useState } from 'react'
import type { Api } from './api'

export default function WorkspaceSetup({
  api,
  createOrganization,
  setActive,
  complete,
  cancel,
  hasMemberships,
}: {
  api: Api
  createOrganization: (params: { name: string }) => Promise<{ id: string } | undefined>
  setActive: (params: { organization: string }) => Promise<unknown>
  complete: () => void
  cancel?: () => void
  hasMemberships: boolean
}) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const organization = await createOrganization({ name: name.trim() })
      if (!organization) throw new Error('Clerk could not create the workspace. Please try again.')
      await setActive({ organization: organization.id })
      await api('/organizations/current', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      }, organization.id)
      complete()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="workspace-message">
      <form className="access-card workspace-create" onSubmit={create}>
        <span className="eyebrow">LEVICITY</span>
        <h1>Create a workspace.</h1>
        <p>
          {hasMemberships
            ? 'Start a new workspace for a different production or team.'
            : 'Set up the workspace where your production team will work.'}
        </p>
        <label htmlFor="workspace-name">Workspace name</label>
        <input
          id="workspace-name"
          autoFocus
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Brightline Productions"
        />
        <button className="button primary" disabled={busy || !name.trim()}>
          {busy ? 'Creating…' : 'Create workspace'}
        </button>
        {cancel && (
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={cancel}
          >
            Cancel
          </button>
        )}
        {error && <p role="alert" className="error-box">{error}</p>}
      </form>
    </div>
  )
}
