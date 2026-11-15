import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { getToken, signOut } from '@/lib/auth'
import { deleteAddress, myAccount, requestCancellation, saveAddress, saveProfile } from '@/lib/account'

export const Route = createFileRoute('/account')({
  head: () => ({ meta: [{ title: 'My Account | KLEEVO' }, { name: 'robots', content: 'noindex' }] }),
  component: AccountPage,
})

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`
const card = 'rounded-lg border border-gray-200 bg-white p-4'
const input = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

function AccountPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Awaited<ReturnType<typeof myAccount>> | null>(null)
  const [err, setErr] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [wa, setWa] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const token = await getToken()
    if (!token) return void navigate({ to: '/login' })
    try {
      const d = await myAccount({ data: { token } })
      setData(d); setName(d.profile?.full_name ?? ''); setPhone(d.profile?.phone ?? ''); setWa(Boolean(d.profile?.whatsapp_consent))
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load your account') }
  }, [navigate])
  useEffect(() => { void load() }, [load])

  const run = async (fn: (token: string) => Promise<unknown>, ok?: string) => {
    setMsg('')
    try { const t = await getToken(); if (!t) return void navigate({ to: '/login' }); await fn(t); if (ok) setMsg(ok); await load() } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }

  if (err) return <p className="py-24 text-center text-red-600" role="alert">{err}</p>
  if (!data) return <p className="py-24 text-center text-gray-400">Loading…</p>

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-3 py-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">My Account</h1><button className="text-sm underline" onClick={() => { signOut(); void navigate({ to: '/' }) }}>Sign out</button></div>
      {msg && <p role="status" className="text-sm text-gray-700">{msg}</p>}

      <section className={card}>
        <h2 className="mb-2 font-bold">Profile</h2>
        <p className="mb-2 text-sm text-gray-500">{data.email}</p>
        <div className="flex flex-wrap items-end gap-2">
          <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={input} placeholder="Mobile (10 digits)" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="text-sm"><input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} /> OK to send order updates on WhatsApp</label>
          <button className="rounded-md bg-[#2874f0] px-3 py-1.5 text-sm font-semibold text-white" onClick={() => run((token) => saveProfile({ data: { token, fullName: name, phone, whatsappConsent: wa } }), 'Profile saved')}>Save</button>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-2 font-bold">Order history</h2>
        {data.orders.length === 0 && <p className="text-sm text-gray-500">No orders yet. <Link to="/" className="text-[#2874f0] underline">Start shopping</Link></p>}
        {data.orders.map((o: any) => (
          <div key={o.id} className="border-t py-3 first:border-t-0">
            <div className="flex flex-wrap justify-between gap-2">
              <Link to="/order/$orderNumber" params={{ orderNumber: o.order_number }} className="font-bold text-[#2874f0]">{o.order_number}</Link>
              <span className="text-sm">{new Date(o.created_at).toLocaleDateString('en-IN')} · <b>{inr(o.total_amount)}</b></span>
            </div>
            <p className="text-sm">Status: <b>{o.order_status.replace(/_/g, ' ')}</b> · Payment: <b>{o.payment_status}</b></p>
            <p className="text-sm text-gray-600">{o.order_items.map((i: any) => `${i.quantity} × ${i.product_name}`).join(', ')}</p>
            {o.shipping_details?.tracking_number && <p className="text-sm">Tracking: {o.shipping_details.carrier} {o.shipping_details.tracking_url ? <a className="text-[#2874f0] underline" href={o.shipping_details.tracking_url} target="_blank" rel="noreferrer">{o.shipping_details.tracking_number}</a> : o.shipping_details.tracking_number}</p>}
            {o.cancel_requested ? <p className="text-sm font-semibold text-amber-700">Cancellation requested — we will confirm shortly.</p>
              : ['pending', 'confirmed', 'processing', 'packed'].includes(o.order_status) && <button className="mt-1 text-sm text-red-600 underline" onClick={() => { const r = prompt('Reason for cancelling (optional)') ; if (r !== null) void run((token) => requestCancellation({ data: { token, orderId: o.id, reason: r } }), 'Cancellation requested') }}>Request cancellation</button>}
          </div>
        ))}
      </section>

      <section className={card}>
        <h2 className="mb-2 font-bold">Saved addresses</h2>
        {data.addresses.map((a: any) => (
          <div key={a.id} className="flex justify-between gap-2 border-t py-2 text-sm first:border-t-0">
            <span><b>{a.full_name}</b>, {a.phone} — {[a.line1, a.line2, a.landmark, a.city, a.state, a.pincode].filter(Boolean).join(', ')}</span>
            <button className="text-red-600 underline" onClick={() => run((token) => deleteAddress({ data: { token, id: a.id } }))}>Delete</button>
          </div>
        ))}
        <AddressForm onSave={(v) => run((token) => saveAddress({ data: { token, ...v } }), 'Address saved')} />
      </section>
    </div>
  )
}

function AddressForm({ onSave }: { onSave: (v: { fullName: string; phone: string; line1: string; city: string; state: string; pincode: string }) => void }) {
  const [v, setV] = useState({ fullName: '', phone: '', line1: '', city: '', state: 'Karnataka', pincode: '' })
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value })
  return (
    <form className="mt-3 grid gap-2 sm:grid-cols-3" onSubmit={(e) => { e.preventDefault(); onSave(v) }}>
      <input className={input} required placeholder="Full name" value={v.fullName} onChange={set('fullName')} />
      <input className={input} required placeholder="Mobile" inputMode="numeric" pattern="[6-9][0-9]{9}" value={v.phone} onChange={set('phone')} />
      <input className={input} required placeholder="House no., street" minLength={5} value={v.line1} onChange={set('line1')} />
      <input className={input} required placeholder="City" value={v.city} onChange={set('city')} />
      <input className={input} required placeholder="State" value={v.state} onChange={set('state')} />
      <input className={input} required placeholder="PIN code" inputMode="numeric" pattern="[1-9][0-9]{5}" value={v.pincode} onChange={set('pincode')} />
      <button className="rounded-md bg-[#2874f0] px-3 py-1.5 text-sm font-semibold text-white sm:col-span-3">Add address</button>
    </form>
  )
}
