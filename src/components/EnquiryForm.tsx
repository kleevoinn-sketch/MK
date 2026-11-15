import { useState } from 'react'
import { submitEnquiry } from '@/lib/enquiry'

const field = 'w-full rounded-md border border-white/30 bg-white px-3 py-2 text-sm text-gray-900'

export function EnquiryForm() {
  const [f, setF] = useState({ name: '', phone: '', email: '', message: '', website: '' })
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [err, setErr] = useState('')

  if (state === 'done')
    return <p role="status" className="rounded-lg bg-white/10 p-4 text-sm ring-1 ring-white/20">Thank you — we have received your message and will contact you soon.</p>

  return (
    <form
      className="space-y-2 rounded-lg bg-white/10 p-4 ring-1 ring-white/20"
      onSubmit={async (e) => {
        e.preventDefault()
        setState('sending'); setErr('')
        try {
          await submitEnquiry({ data: f })
          setState('done')
        } catch (x) {
          setErr(x instanceof Error && /Too many/.test(x.message) ? x.message : 'Could not send your message. Please call or WhatsApp us.')
          setState('error')
        }
      }}
    >
      <p className="font-semibold">Send us an enquiry</p>
      <label className="block text-xs">Name<input className={field} required minLength={2} maxLength={100} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
      <label className="block text-xs">Mobile number<input className={field} required inputMode="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
      <label className="block text-xs">Email (optional)<input className={field} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
      <label className="block text-xs">Message<textarea className={field} required minLength={5} maxLength={2000} rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" name="website" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      {state === 'error' && <p role="alert" className="text-sm text-amber-200">{err}</p>}
      <button disabled={state === 'sending'} className="rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-gray-900 disabled:opacity-60">{state === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
    </form>
  )
}
