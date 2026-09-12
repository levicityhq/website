import { useAuth, useOrganizationList, UserButton } from '@clerk/react'
import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useApi, useResource, money, date } from './api'
import type { Api, Me, Project, InvoicePage, ProjectCostSummary } from './api'
import InvoicePanel from './InvoicePanel'
import MembersPage from './MembersPage'
import WorkspaceSetup from './WorkspaceSetup'
import ThemeToggle from './ThemeToggle'

export default function Dashboard() {
  const { orgId } = useAuth()
  const { isLoaded, createOrganization, setActive, userMemberships } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')
  const [creatingWorkspace, setCreatingWorkspace] = useState(false)
  const api = useApi()
  const navigate = useNavigate()
  const memberships = userMemberships.data || []
  async function select(id: string) {
    setSwitching(true)
    setError('')
    try {
      await setActive?.({ organization: id })
      navigate('/dashboard')
    } catch {
      setError('Could not switch organizations. Please try again.')
    } finally {
      setSwitching(false)
    }
  }
  useEffect(() => {
    if (
      isLoaded &&
      !orgId &&
      memberships.length === 1 &&
      !userMemberships.hasNextPage
    ) {
      void select(memberships[0].organization.id)
    }
    // Activate a sole membership only when Clerk's membership result changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, orgId, userMemberships.data])
  const selector = (
    <div className="organization-control">
      <label htmlFor="organization">Workspace</label>
      <select
        id="organization"
        value={orgId || ''}
        disabled={switching}
        onChange={(e) => void select(e.target.value)}
      >
        <option value="" disabled>
          Select organization
        </option>
        {memberships.map((m) => (
          <option key={m.id} value={m.organization.id}>
            {m.organization.name}
          </option>
        ))}
      </select>
      {userMemberships.hasNextPage && (
        <button
          className="text-action"
          onClick={() => void userMemberships.fetchNext()}
        >
          More organizations
        </button>
      )}
      <button
        className="text-action create-workspace-action"
        disabled={switching}
        onClick={() => setCreatingWorkspace(true)}
      >
        + Create workspace
      </button>
    </div>
  )
  if (!isLoaded || userMemberships.isLoading)
    return (
      <div className="workspace-message" role="status">
        Loading your workspace…
      </div>
    )
  if (userMemberships.error)
    return (
      <div className="workspace-message">
        <p role="alert">Unable to load your organizations.</p>
        <button
          className="button"
          onClick={() => void userMemberships.revalidate()}
        >
          Try again
        </button>
        <UserButton />
      </div>
    )
  if (creatingWorkspace)
    return (
      <WorkspaceSetup
        api={api}
        createOrganization={createOrganization}
        setActive={async ({ organization }) => setActive?.({ organization })}
        complete={() => {
          setCreatingWorkspace(false)
          navigate('/dashboard')
        }}
        cancel={() => setCreatingWorkspace(false)}
        hasMemberships={memberships.length > 0}
      />
    )
  if (!orgId || switching)
    return (
      <div className="workspace-message">
        <div className="access-card">
          <span className="eyebrow">LEVICITY</span>
          <h1>{memberships.length ? 'Choose your workspace.' : 'Welcome to Levicity.'}</h1>
          <p>
            {memberships.length
              ? 'Select an organization to continue.'
              : 'Create your workspace or join one using an invitation from its administrator.'}
          </p>
          {memberships.length > 0 && selector}
          <div className="access-actions">
            <button className="button primary" onClick={() => setCreatingWorkspace(true)}>
              Create workspace
            </button>
            <UserButton />
          </div>
          {error && <p role="alert">{error}</p>}
        </div>
      </div>
    )
  return (
    <Workspace
      key={orgId || 'personal'}
      selector={selector}
      switchError={error}
      switching={switching}
    />
  )
}

function Workspace({
  selector,
  switchError,
  switching,
}: {
  selector: React.ReactNode
  switchError: string
  switching: boolean
}) {
  const api = useApi()
  const [version, setVersion] = useState(0)
  const me = useResource<Me>(api, '/me', version)
  const [mobileLocation, setMobileLocation] = useState<string | null>(null)
  const location = useLocation()
  const mobile = mobileLocation === location.key
  const setMobile = (open: boolean) =>
    setMobileLocation(open ? location.key : null)
  return (
    <div className="workspace">
      <aside className={`workspace-sidebar ${mobile ? 'is-open' : ''}`}>
        <Link to="/dashboard" className="workspace-logo">
          <span>L</span>levicity
        </Link>
        {selector}
        <nav aria-label="Workspace navigation">
          <NavLink to="/dashboard" end>
            ◫ <span>Overview</span>
          </NavLink>
          <NavLink to="/dashboard/invoices">
            ≡ <span>Invoices</span>
          </NavLink>
          <NavLink to="/dashboard/projects">
            ▱ <span>Projects</span>
          </NavLink>
          <NavLink to="/dashboard/settings/members">
            ♙ <span>Team</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <span className="eyebrow">LESS ADMIN. MORE MAKING.</span>
          <p>Lightening your load.</p>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="workspace-body">
        <header className="workspace-topbar">
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            ☰
          </button>
          <span>{me.data?.organization_name || 'Your workspace'}</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="workspace-main">
          {switchError && (
            <p role="alert" className="error-box">
              {switchError}
            </p>
          )}
          {me.loading || switching ? (
            <p role="status">Opening your workspace…</p>
          ) : me.error ? (
            <div className="empty-state">
              <h1>We couldn’t open this workspace.</h1>
              <p role="alert">{me.error}</p>
              <button
                className="button"
                onClick={() => setVersion((v) => v + 1)}
              >
                Try again
              </button>
            </div>
          ) : (
            me.data && <WorkspaceContent api={api} me={me.data} />
          )}
        </main>
      </div>
    </div>
  )
}

function WorkspaceContent({
  api,
  me,
}: {
  api: Api
  me: Me
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const projectId = params.get('project') || ''
  const invoiceId = params.get('invoice')
  const isProjects = location.pathname === '/dashboard/projects'
  const projectPageId = location.pathname.match(/^\/dashboard\/projects\/([^/]+)$/)?.[1]
  const isOverview = location.pathname === '/dashboard'
  const isMembers = location.pathname === '/dashboard/settings/members'
  const base = `/organizations/${encodeURIComponent(me.organization_slug)}`
  const [version, setVersion] = useState(0)
  const projects = useResource<Project[]>(api, `${base}/projects`, version)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const refresh = () => setVersion((v) => v + 1)
  async function create(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setCreateError('')
    try {
      const project = await api<Project>(`${base}/projects`, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim() }),
      })
      setCreating(false)
      setName('')
      refresh()
      navigate(`/dashboard/projects/${project.id}`)
    } catch (e) {
      setCreateError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  if (isMembers) return <MembersPage />
  if (projectPageId)
    return <ProjectPage api={api} base={base} projectId={projectPageId} />
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR PRODUCTION WORKSPACE</span>
          <h1>
            {isOverview
              ? 'A little more clarity.'
              : isProjects
                ? 'Your projects.'
                : 'Your invoices.'}
          </h1>
          <p>
            {isOverview
              ? 'Your projects and latest invoices, all in one place.'
              : isProjects
                ? 'Keep every production’s paperwork together.'
                : 'The details, without the digging.'}
          </p>
        </div>
        <button className="button primary" onClick={() => setCreating(true)}>
          + New project
        </button>
      </div>
      {creating && (
        <form className="project-create" onSubmit={create}>
          <label>
            Project name
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fall Campaign"
            />
          </label>
          <button className="button primary" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create project'}
          </button>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => setCreating(false)}
          >
            Cancel
          </button>
          {createError && (
            <p role="alert" className="error-box">
              {createError}
            </p>
          )}
        </form>
      )}
      {(isOverview || isProjects) && (
        <section className="project-section">
          <div className="section-heading">
            <h2>
              Active projects{' '}
              <span className="count">{projects.data?.length ?? '—'}</span>
            </h2>
            {isOverview && (
              <Link className="text-action" to="/dashboard/projects">
                View all projects ↗
              </Link>
            )}
          </div>
          {projects.loading ? (
            <div
              className="skeleton-grid"
              role="status"
              aria-label="Loading projects"
            >
              <div />
              <div />
              <div />
            </div>
          ) : projects.error ? (
            <ErrorState message={projects.error} retry={refresh} />
          ) : !projects.data?.length ? (
            <div className="empty-state">
              <h3>A fresh start.</h3>
              <p>Create your first project to organize incoming invoices.</p>
            </div>
          ) : (
            <div className="project-grid">
              {(isOverview ? projects.data.slice(0, 6) : projects.data).map(
                (p, index) => (
                  <Link
                    className="project-card"
                    key={p.id}
                    to={`/dashboard/projects/${p.id}`}
                  >
                    <div>
                      <span className="eyebrow">
                        {String(index + 1).padStart(2, '0')} / PROJECT
                      </span>
                      <span className="project-arrow">↗</span>
                    </div>
                    <h3>{p.name}</h3>
                    <p>
                      <strong>{p.invoice_count}</strong>{' '}
                      {p.invoice_count === 1 ? 'invoice' : 'invoices'}
                      <span>View invoices →</span>
                    </p>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      )}
      {!isProjects && (
        <section>
          <div className="section-heading">
            <h2>
              {isOverview
                ? 'Recent invoices'
                : projects.data?.find((p) => p.id === projectId)?.name ||
                  'All invoices'}
            </h2>
            <label className="filter-label">
              Project
              <select
                value={projectId}
                onChange={(e) => {
                  const next = new URLSearchParams(params)
                  next.delete('invoice')
                  if (e.target.value) next.set('project', e.target.value)
                  else next.delete('project')
                  setParams(next)
                }}
              >
                <option value="">All projects</option>
                {projects.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <InvoiceList
            key={`${projectId}:${version}`}
            api={api}
            path={`${base}/invoices?limit=20${projectId ? `&project_id=${encodeURIComponent(projectId)}` : ''}`}
            open={(id) => {
              const next = new URLSearchParams(params)
              next.set('invoice', id)
              setParams(next)
            }}
          />
        </section>
      )}
      {invoiceId && (
        <InvoicePanel
          key={invoiceId}
          api={api}
          base={base}
          id={invoiceId}
          projects={projects.data || []}
          close={() => {
            const next = new URLSearchParams(params)
            next.delete('invoice')
            setParams(next)
          }}
          saved={refresh}
        />
      )}
    </>
  )
}

function ProjectPage({
  api,
  base,
  projectId,
}: {
  api: Api
  base: string
  projectId: string
}) {
  const [version, setVersion] = useState(0)
  const summary = useResource<ProjectCostSummary>(
    api,
    `${base}/projects/${encodeURIComponent(projectId)}/cost-summary`,
    version,
  )
  const projects = useResource<Project[]>(api, `${base}/projects`, version)
  const [params, setParams] = useSearchParams()
  const invoiceId = params.get('invoice')
  if (summary.loading)
    return <div className="empty-state" role="status">Loading project costs…</div>
  if (summary.error)
    return <ErrorState message={summary.error} retry={() => window.location.reload()} />
  if (!summary.data) return null
  const data = summary.data
  return (
    <>
      <div className="page-heading">
        <div>
          <Link className="text-action mb-5 block w-fit" to="/dashboard/projects">← All projects</Link>
          <span className="eyebrow block">PROJECT COSTS</span>
          <h1>{data.name}</h1>
          <p>{data.invoice_count} {data.invoice_count === 1 ? 'invoice' : 'invoices'} categorized for this project.</p>
        </div>
      </div>
      <section className="project-cost-totals">
        {data.totals.length ? data.totals.map((total) => (
          <div key={total.currency || 'unknown'}>
            <span className="eyebrow">TOTAL PROJECT COST{total.currency ? ` · ${total.currency}` : ''}</span>
            <strong>{money(total.total, total.currency)}</strong>
          </div>
        )) : <div><span className="eyebrow">TOTAL PROJECT COST</span><strong>—</strong></div>}
      </section>
      <section className="project-category-costs">
        <div className="section-heading"><h2>Cost by category</h2></div>
        {!data.categories.length ? (
          <div className="empty-state"><h3>No costs yet.</h3><p>Invoices assigned to this project will appear here.</p></div>
        ) : (
          <div className="table-scroll"><table><thead><tr><th>Category</th><th>Invoices</th><th className="amount">Subtotal</th></tr></thead><tbody>
            {data.categories.map((category) => <tr key={`${category.code || 'uncategorized'}:${category.currency || ''}`}>
              <td><span className="category-tag">{category.code ? `${category.code} / ${category.name}` : category.name}</span></td>
              <td>{category.invoice_count}</td>
              <td className="amount">{money(category.total, category.currency)}</td>
            </tr>)}
          </tbody></table></div>
        )}
        <div className="section-heading mt-10"><h2>Invoices by category</h2></div>
        <InvoiceList
          key={version}
          api={api}
          path={`${base}/invoices?limit=100&project_id=${encodeURIComponent(projectId)}`}
          groupByCategory
          open={(id) => {
            const next = new URLSearchParams(params)
            next.set('invoice', id)
            setParams(next)
          }}
        />
      </section>
      {invoiceId && (
        <InvoicePanel
          key={invoiceId}
          api={api}
          base={base}
          id={invoiceId}
          projects={projects.data || []}
          close={() => {
            const next = new URLSearchParams(params)
            next.delete('invoice')
            setParams(next)
          }}
          saved={() => setVersion((current) => current + 1)}
        />
      )}
    </>
  )
}

export function ErrorState({
  message,
  retry,
}: {
  message: string
  retry: () => void
}) {
  return (
    <div className="error-box">
      <p role="alert">{message}</p>
      <button className="text-action" onClick={retry}>
        Try again
      </button>
    </div>
  )
}
function InvoiceList({
  api,
  path,
  open,
  groupByCategory = false,
}: {
  api: Api
  path: string
  open: (id: string) => void
  groupByCategory?: boolean
}) {
  const [version, setVersion] = useState(0)
  const resource = useResource<InvoicePage>(api, path, version)
  const [extra, setExtra] = useState<InvoicePage | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const page = extra || resource.data
  async function more() {
    if (!page?.next_cursor) return
    setBusy(true)
    setError('')
    try {
      const next = await api<InvoicePage>(
        `${path}&cursor=${encodeURIComponent(page.next_cursor)}`,
      )
      setExtra({
        items: [
          ...page.items,
          ...next.items.filter(
            (item) => !page.items.some((p) => p.id === item.id),
          ),
        ],
        next_cursor: next.next_cursor,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  if (resource.loading)
    return (
      <div className="empty-state" role="status">
        Loading invoices…
      </div>
    )
  if (resource.error)
    return (
      <ErrorState
        message={resource.error}
        retry={() => setVersion((v) => v + 1)}
      />
    )
  if (!page?.items.length)
    return (
      <div className="empty-state">
        <span className="empty-icon">≡</span>
        <h3>Nothing here just yet.</h3>
        <p>Incoming invoices will appear here as they’re processed.</p>
      </div>
    )
  const groups = groupByCategory
    ? Array.from(
        page.items.reduce((result, invoice) => {
          const key = invoice.category?.code || 'uncategorized'
          const group = result.get(key) || {
            label: invoice.category
              ? `${invoice.category.code} / ${invoice.category.name}`
              : 'Uncategorized',
            invoices: [],
          }
          group.invoices.push(invoice)
          result.set(key, group)
          return result
        }, new Map<string, { label: string; invoices: InvoicePage['items'] }>()),
      ).sort(([first], [second]) => {
        if (first === 'uncategorized') return 1
        if (second === 'uncategorized') return -1
        return first.localeCompare(second)
      })
    : []
  return (
    <>
      {groupByCategory ? (
        <div className="grid gap-8">
          {groups.map(([key, group]) => (
            <div key={key}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="category-tag">{group.label}</span>
                <span className="font-mono text-[10px] text-muted">
                  {group.invoices.length} {group.invoices.length === 1 ? 'invoice' : 'invoices'}
                </span>
              </div>
              <InvoiceTable invoices={group.invoices} open={open} />
            </div>
          ))}
        </div>
      ) : (
        <InvoiceTable invoices={page.items} open={open} />
      )}
      <div className="list-footer">
        <span>{page.items.length} invoices shown · Newest received first</span>
        {page.next_cursor && (
          <button
            className="button"
            disabled={busy}
            onClick={() => void more()}
          >
            {busy ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
      {error && <ErrorState message={error} retry={() => void more()} />}
    </>
  )
}

function InvoiceTable({
  invoices,
  open,
}: {
  invoices: InvoicePage['items']
  open: (id: string) => void
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Vendor / invoice</th>
            <th>Project</th>
            <th>Category</th>
            <th className="amount">Amount</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td>
                <button className="invoice-link" onClick={() => open(i.id)}>
                  {i.vendor_name || 'Unknown vendor'}
                </button>
                <span className="cell-subtitle">
                  {i.invoice_number || 'No invoice number'} · {i.status}
                </span>
              </td>
              <td>
                {i.project?.name || <span className="unassigned">Unassigned</span>}
              </td>
              <td>
                <span className="category-tag">
                  {i.category
                    ? `${i.category.code} / ${i.category.name}`
                    : 'Uncategorized'}
                </span>
              </td>
              <td className="amount">{money(i.total, i.currency)}</td>
              <td className="received">{date(i.received_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
