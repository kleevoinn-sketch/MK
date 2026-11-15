// Server-only Supabase helpers (REST via fetch, no SDK dependency).
// Never import this file from client code. The service-role key bypasses RLS.

const url = () => {
  const v = process.env.SUPABASE_URL
  if (!v) throw new Error('SUPABASE_URL is not configured')
  return v.replace(/\/$/, '')
}
const serviceKey = () => {
  const v = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!v) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  return v
}
const anonKey = () => {
  const v = process.env.SUPABASE_ANON_KEY
  if (!v) throw new Error('SUPABASE_ANON_KEY is not configured')
  return v
}

type Query = Record<string, string>

async function call<T>(path: string, init: RequestInit & { key?: string; token?: string }): Promise<T> {
  const key = init.key ?? serviceKey()
  const res = await fetch(`${url()}${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${init.token ?? key}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try {
      msg = JSON.parse(text).message ?? text
    } catch {
      /* keep raw text */
    }
    throw new Error(msg || `Supabase request failed (${res.status})`)
  }
  return (text ? JSON.parse(text) : null) as T
}

const qs = (q?: Query) => (q && Object.keys(q).length ? '?' + new URLSearchParams(q).toString() : '')

/** SELECT with PostgREST filters, e.g. select('orders', { select: '*', order_number: 'eq.KLV1' }) */
export function select<T = unknown>(table: string, q?: Query) {
  return call<Array<T>>(`/rest/v1/${table}${qs(q)}`, { method: 'GET' })
}

export function insert<T = unknown>(table: string, row: object) {
  return call<Array<T>>(`/rest/v1/${table}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })
}

export function update<T = unknown>(table: string, filter: Query, patch: object) {
  return call<Array<T>>(`/rest/v1/${table}${qs(filter)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
}

export function remove(table: string, filter: Query) {
  return call<null>(`/rest/v1/${table}${qs(filter)}`, { method: 'DELETE' })
}

export function rpc<T = unknown>(fn: string, args: object) {
  return call<T>(`/rest/v1/rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) })
}

/** Verify a customer/admin access token and return the user, or null. */
export async function getUser(token: string | null | undefined): Promise<{ id: string; email?: string } | null> {
  if (!token) return null
  try {
    const u = await call<{ id: string; email?: string }>('/auth/v1/user', { method: 'GET', key: anonKey(), token })
    return u?.id ? u : null
  } catch {
    return null
  }
}

/** True only if the token's user is listed in private.admin_users (checked by the DB itself). */
export async function isAdminToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const r = await call<boolean>('/rest/v1/rpc/is_kleevo_admin', { method: 'POST', key: anonKey(), token, body: '{}' })
    return r === true
  } catch {
    return false
  }
}

export async function requireAdmin(token: string | null | undefined) {
  if (!(await isAdminToken(token))) throw new Error('Not authorised')
  const user = await getUser(token)
  return user!
}
