import { useAuth } from '@clerk/react'
import { useCallback, useEffect, useState } from 'react'

export interface Me {
  clerk_user_id: string
  organization_slug: string
  organization_name: string
  organization_role: string
}
export interface Project {
  id: string
  name: string
  is_active: boolean
  invoice_count: number
}
export interface ProjectCategoryCost {
  code: string | null
  name: string
  currency: string | null
  total: string
  invoice_count: number
}
export interface ProjectCostSummary {
  id: string
  name: string
  invoice_count: number
  totals: ProjectCategoryCost[]
  categories: ProjectCategoryCost[]
}
export interface Category {
  code: string
  display_name: string
}
interface Assignment {
  name: string
  confidence: string | null
  rationale: string | null
}
export interface Invoice {
  id: string
  vendor_name: string | null
  invoice_number: string | null
  invoice_date: string | null
  total: string | null
  currency: string | null
  status: string
  received_at: string
  project: (Assignment & { id: string }) | null
  category: (Assignment & { code: string; rag_eligible: boolean | null }) | null
}
export interface InvoicePage {
  items: Invoice[]
  next_cursor: string | null
}
export interface InvoiceDetail extends Pick<
  Invoice,
  'id' | 'status' | 'received_at' | 'project' | 'category'
> {
  filename: string
  email_sender: string | null
  email_subject: string | null
  fields: Record<
    string,
    string | number | null | Record<string, string | number>
  >
}
export function useApi() {
  const { getToken, orgId } = useAuth()
  return useCallback(
    async <T>(
      path: string,
      init: RequestInit = {},
      organizationId = orgId,
    ): Promise<T> => {
      const token = await getToken({ organizationId: organizationId || undefined })
      if (!token)
        throw new Error('Your session has ended. Please sign in again.')
      let response: Response
      try {
        response = await fetch(
          `${import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/v1${path}`,
          {
            ...init,
            headers: {
              'Content-Type': 'application/json',
              ...init.headers,
              Authorization: `Bearer ${token}`,
            },
          },
        )
      } catch {
        throw new Error(
          'Unable to reach Levicity. Check that the API is running and allows this site’s address.',
        )
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const messages: Record<number, string> = {
          401: 'Your session or site address was not accepted. Sign in again or contact your administrator.',
          403: 'This organization does not have access to Levicity yet. Contact your administrator.',
          404: 'This item is no longer available in your organization.',
          409: 'A project with that name already exists.',
          422: 'Check your entries and try again.',
        }
        const error = new Error(
          typeof body.detail === 'string'
            ? body.detail
            : messages[response.status] || 'Something went wrong. Please try again.',
        ) as Error & { status: number }
        error.status = response.status
        throw error
      }
      return response.status === 204 ? (undefined as T) : response.json()
    },
    [getToken, orgId],
  )
}
export type Api = ReturnType<typeof useApi>
export function useResource<T>(api: Api, path: string, version = 0) {
  const [state, setState] = useState<{
    data?: T
    error?: string
    status?: number
    loading: boolean
    path?: string
    version?: number
  }>({ loading: true })
  useEffect(() => {
    let current = true
    api<T>(path)
      .then((data) => {
        if (current) setState({ data, loading: false, path, version })
      })
      .catch((error) => {
        if (current)
          setState({
            error: error.message,
            status: error.status,
            loading: false,
            path,
            version,
          })
      })
    return () => {
      current = false
    }
  }, [api, path, version])
  return state.path === path && state.version === version
    ? state
    : { loading: true, data: undefined, error: undefined, status: undefined }
}
export function money(amount: string | null, currency: string | null) {
  if (amount == null) return '—'
  // Keep the API decimal string intact; never round money through a float.
  const [whole, fraction] = amount.split('.')
  return `${currency || '—'} ${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction === undefined ? '' : `.${fraction}`}`
}
export const date = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
