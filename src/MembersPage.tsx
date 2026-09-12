import { useAuth, useOrganization } from '@clerk/react'
import { useState } from 'react'

export default function MembersPage() {
  const { orgRole } = useAuth()
  const { isLoaded, organization, memberships } = useOrganization({
    memberships: { infinite: true },
  })
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!organization) return
    setBusy(true)
    setError('')
    try {
      await organization.inviteMember({
        emailAddress: email.trim(),
        role: 'org:member',
      })
      setEmail('')
    } catch {
      setError('Clerk could not send this invitation. Check the email and try again.')
    } finally {
      setBusy(false)
    }
  }

  const members = memberships?.data || []
  const admin = orgRole === 'org:admin' || orgRole === 'admin'
  return (
    <section className="organization-profile-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE SETTINGS</span>
          <h1>Your team.</h1>
          <p>Invite teammates and manage workspace access.</p>
        </div>
      </div>
      {!isLoaded ? (
        <div className="empty-state" role="status">Loading your team…</div>
      ) : !organization ? (
        <div className="error-box" role="alert">Choose a workspace to manage its team.</div>
      ) : (
        <>
          {admin && (
            <form className="member-invite" onSubmit={invite}>
              <label htmlFor="member-email">Invite a teammate</label>
              <input
                id="member-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <button className="button primary" disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : 'Send invitation'}
              </button>
            </form>
          )}
          {error && <p role="alert" className="error-box">{error}</p>}
          <section className="member-list" aria-label="Workspace members">
            {members.map((membership) => {
              const user = membership.publicUserData
              if (!user) return null
              const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
              return (
                <div className="member-row" key={membership.id}>
                  <div>
                    <strong>{name || user.identifier || 'Team member'}</strong>
                    <span>{user.identifier || user.userId}</span>
                  </div>
                  <span className="role-tag">{membership.role.replace('org:', '')}</span>
                </div>
              )
            })}
          </section>
        </>
      )}
    </section>
  )
}
