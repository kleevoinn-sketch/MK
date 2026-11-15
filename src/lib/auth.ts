// Browser-side Supabase Auth over REST (no SDK). Only the public URL + publishable (anon) key are used here.
const URL_ = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '')
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const STORE = 'kleevo-session'

export type Session = { access_token: string; refresh_token: string; expires_at: number; user: { id: string; email?: string; user_metadata?: { full_name?: string } } }

export const authConfigured = () => Boolean(URL_ && KEY)

async function gotrue(path: string, body: object, token?: string) {
  if (!URL_ || !KEY) throw new Error('Sign-in is not configured yet')
  const res = await fetch(`${URL_}/auth/v1${path}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.msg || json.error_description || json.message || 'Request failed')
  return json
}

function save(s: Session | null) {
  try {
    if (s) localStorage.setItem(STORE, JSON.stringify(s))
    else localStorage.removeItem(STORE)
  } catch {
    /* storage unavailable */
  }
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORE)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function withExpiry(j: any): Session {
  return { ...j, expires_at: j.expires_at ?? Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600) }
}

export async function signIn(email: string, password: string) {
  const s = withExpiry(await gotrue('/token?grant_type=password', { email, password }))
  save(s)
  return s
}

/** Returns a session if sign-up logs the user in straight away; null when email confirmation is required. */
export async function signUp(email: string, password: string, fullName: string) {
  const j = await gotrue('/signup', { email, password, data: { full_name: fullName } })
  if (j.access_token) {
    const s = withExpiry(j)
    save(s)
    return s
  }
  return null
}

export const resetPassword = (email: string) => gotrue('/recover', { email, redirect_to: `${window.location.origin}/login` })

export function signOut() {
  save(null)
}

/** A valid access token, refreshed if it is about to expire. */
export async function getToken(): Promise<string | null> {
  const s = getSession()
  if (!s) return null
  if (s.expires_at - 60 > Math.floor(Date.now() / 1000)) return s.access_token
  try {
    const n = withExpiry(await gotrue('/token?grant_type=refresh_token', { refresh_token: s.refresh_token }))
    save(n)
    return n.access_token
  } catch {
    save(null)
    return null
  }
}
