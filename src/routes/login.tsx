import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { authConfigured, resetPassword, signIn, signUp } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Sign in | KLEEVO' }, { name: 'robots', content: 'noindex' }] }),
  component: LoginPage,
})

const input = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm'

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (!authConfigured()) return <p className="py-24 text-center text-gray-500">Accounts are not available yet.</p>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    try {
      if (mode === 'signin') { await signIn(f.email, f.password); await navigate({ to: '/account' }) }
      else if (mode === 'register') {
        const s = await signUp(f.email, f.password, f.name)
        if (s) await navigate({ to: '/account' })
        else setMsg('Account created. Please check your email to confirm your address, then sign in.')
      } else { await resetPassword(f.email); setMsg('If that email has an account, a reset link is on its way.') }
    } catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong') }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="mx-auto my-12 max-w-sm space-y-3 rounded-lg bg-white p-6 shadow">
      <h1 className="text-xl font-bold">{mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Create your account' : 'Reset password'}</h1>
      {mode === 'register' && <input className={input} required minLength={2} placeholder="Full name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
      <input className={input} type="email" required placeholder="Email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      {mode !== 'forgot' && <input className={input} type="password" required minLength={8} placeholder="Password (min 8 characters)" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {msg && <p role="status" className="text-sm text-green-700">{msg}</p>}
      <button disabled={busy} className="w-full rounded-md bg-[#fb641b] py-2 font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}</button>
      <div className="flex justify-between text-sm text-[#2874f0]">
        {mode !== 'signin' ? <button type="button" onClick={() => setMode('signin')}>Back to sign in</button> : <button type="button" onClick={() => setMode('register')}>New here? Create account</button>}
        {mode === 'signin' && <button type="button" onClick={() => setMode('forgot')}>Forgot password?</button>}
      </div>
    </form>
  )
}
