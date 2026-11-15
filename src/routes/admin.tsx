import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getToken, signIn, signOut } from '@/lib/auth'
import {
  ORDER_STATUSES, adminAdjustStock, adminCheck, adminGetSettings, adminListCoupons, adminListCustomers, adminListEnquiries,
  adminListOrders, adminListProducts, adminOverview, adminSaveCoupon, adminSaveProduct, adminSaveSetting, adminUpdateEnquiry, adminUpdateOrder,
} from '@/lib/admin'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin | KLEEVO' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminPage,
})

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`
const TABS = ['Overview', 'Orders', 'Products & Stock', 'Customers', 'Enquiries', 'Coupons', 'Settings'] as const
type Tab = (typeof TABS)[number]
const card = 'rounded-lg border border-gray-200 bg-white p-4'
const btn = 'rounded-md bg-[#2874f0] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
const input = 'rounded-md border border-gray-300 px-2 py-1.5 text-sm'

function AdminPage() {
  const [state, setState] = useState<'loading' | 'signedout' | 'denied' | 'ok'>('loading')
  const [tab, setTab] = useState<Tab>('Overview')

  const check = useCallback(async () => {
    const token = await getToken()
    if (!token) return setState('signedout')
    try {
      const r = await adminCheck({ data: { token } })
      setState(r.isAdmin ? 'ok' : 'denied')
    } catch {
      setState('signedout')
    }
  }, [])
  useEffect(() => { void check() }, [check])

  if (state === 'loading') return <div className="py-24 text-center text-gray-400">Loading…</div>
  if (state === 'signedout') return <Login onDone={check} />
  if (state === 'denied')
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="font-semibold">This account is not an administrator.</p>
        <button className={`${btn} mt-4`} onClick={() => { signOut(); setState('signedout') }}>Sign out</button>
      </div>
    )

  return (
    <div className="mx-auto max-w-7xl px-3 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-extrabold">KLEEVO Admin</h1>
        <button className="text-sm text-gray-600 underline" onClick={() => { signOut(); setState('signedout') }}>Sign out</button>
      </div>
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold ${tab === t ? 'bg-[#2874f0] text-white' : 'bg-white text-gray-700'}`}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && <Overview />}
      {tab === 'Orders' && <Orders />}
      {tab === 'Products & Stock' && <Products />}
      {tab === 'Customers' && <Customers />}
      {tab === 'Enquiries' && <Enquiries />}
      {tab === 'Coupons' && <Coupons />}
      {tab === 'Settings' && <Settings />}
    </div>
  )
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <form
      className="mx-auto my-16 max-w-sm space-y-3 rounded-lg bg-white p-6 shadow"
      onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr('')
        try { await signIn(email, pw); onDone() } catch (x) { setErr(x instanceof Error ? x.message : 'Sign-in failed') }
        setBusy(false)
      }}
    >
      <h1 className="text-lg font-bold">Admin sign in</h1>
      <input className={`${input} w-full`} type="email" required autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className={`${input} w-full`} type="password" required autoComplete="current-password" placeholder="Password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button className={`${btn} w-full`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}

/** Runs an admin server call with a fresh token and exposes loading/error state. */
function useAdmin<T>(fn: (token: string) => Promise<T>, deps: Array<unknown> = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Session expired. Please sign in again.')
      setData(await fn(token))
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => { void reload() }, [reload])
  return { data, error, loading, reload }
}

async function act<T>(fn: (token: string) => Promise<T>) {
  const token = await getToken()
  if (!token) throw new Error('Session expired. Please sign in again.')
  return fn(token)
}

const State = ({ loading, error }: { loading: boolean; error: string }) =>
  loading ? <Loader2 className="mx-auto my-8 animate-spin text-gray-400" /> : error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null

function Overview() {
  const { data: d, loading, error } = useAdmin((token) => adminOverview({ data: { token } }))
  if (!d) return <State loading={loading} error={error} />
  const max = Math.max(1, ...d.daily.map((x: any) => x.amount))
  const stats: Array<[string, string | number]> = [
    ['Total sales (paid)', inr(d.totalSales)], ['Total orders', d.totalOrders], ['Customers', d.totalCustomers], ['Products', d.totalProducts],
    ['Open orders', d.pendingOrders], ['Delivered', d.completedOrders], ['Payments to verify', d.awaitingPaymentCheck], ['New enquiries', d.newEnquiries],
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([k, v]) => <div key={k} className={card}><p className="text-xs text-gray-500">{k}</p><p className="text-xl font-extrabold">{v}</p></div>)}</div>
      <div className={card}>
        <p className="mb-2 font-semibold">Daily sales (last 30 days with sales)</p>
        {d.daily.length ? (
          <div className="flex h-32 items-end gap-1" role="img" aria-label="Daily sales bar chart">
            {d.daily.map((x: any) => <div key={x.date} title={`${x.date}: ${inr(x.amount)}`} className="flex-1 rounded-t bg-[#2874f0]" style={{ height: `${(x.amount / max) * 100}%` }} />)}
          </div>
        ) : <p className="text-sm text-gray-500">No paid orders yet.</p>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={card}>
          <p className="mb-2 font-semibold">Low / out of stock</p>
          {d.lowStock.length ? d.lowStock.map((p: any) => <p key={p.id} className="text-sm">{p.name} — <b className={p.stock_qty === 0 ? 'text-red-600' : 'text-amber-600'}>{p.stock_qty === 0 ? 'Out of stock' : `${p.stock_qty} left`}</b></p>) : <p className="text-sm text-gray-500">All products are above their alert level.</p>}
        </div>
        <div className={card}>
          <p className="mb-2 font-semibold">Recent orders</p>
          {d.recentOrders.length ? d.recentOrders.map((o: any) => <p key={o.id} className="text-sm">{o.order_number} · {o.customer_name} · {inr(o.total_amount)} · {o.order_status}</p>) : <p className="text-sm text-gray-500">No orders yet.</p>}
        </div>
      </div>
    </div>
  )
}

function Orders() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const { data, loading, error, reload } = useAdmin((token) => adminListOrders({ data: { token, status: status || undefined, q: q || undefined } }), [status, q])
  const [msg, setMsg] = useState('')
  const run = async (orderId: string, change: any) => {
    setMsg('')
    try { await act((token) => adminUpdateOrder({ data: { token, orderId, change } })); await reload() } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input className={input} placeholder="Search order no., name, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      <State loading={loading} error={error} />
      {data?.map((o: any) => <OrderCard key={o.id} o={o} run={run} />)}
      {data && !data.length && <p className="text-sm text-gray-500">No orders found.</p>}
    </div>
  )
}

function OrderCard({ o, run }: { o: any; run: (id: string, change: any) => Promise<void> }) {
  const [carrier, setCarrier] = useState(o.shipping_details?.carrier ?? '')
  const [tn, setTn] = useState(o.shipping_details?.tracking_number ?? '')
  return (
    <div className={card}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold">{o.order_number} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">{o.order_status}</span></p>
          <p className="text-sm text-gray-600">{new Date(o.created_at).toLocaleString('en-IN')}</p>
        </div>
        <p className="text-lg font-extrabold">{inr(o.total_amount)}</p>
      </div>
      <p className="mt-2 text-sm"><b>{o.customer_name}</b> · {o.phone}{o.email ? ` · ${o.email}` : ''}</p>
      <p className="text-sm text-gray-600">{[o.address, o.address_line2, o.landmark, o.city, o.state, o.pincode].filter(Boolean).join(', ')}</p>
      <ul className="mt-2 text-sm">{o.order_items?.map((i: any, n: number) => <li key={n}>{i.quantity} × {i.product_name} @ {inr(i.unit_price)}</li>)}</ul>
      <p className="mt-2 text-sm">Payment: <b>{o.payment_method}</b> · <b className={o.payment_status === 'paid' ? 'text-green-700' : 'text-amber-700'}>{o.payment_status}</b>{o.payment_reference ? ` · UTR ${o.payment_reference}` : ''}</p>
      {o.cancel_requested && <p className="text-sm font-semibold text-red-600">Customer requested cancellation{o.cancel_reason ? `: ${o.cancel_reason}` : ''}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {o.payment_status !== 'paid' && o.order_status !== 'cancelled' && <button className={btn} onClick={() => run(o.id, { action: 'verify_payment' })}>Mark payment verified</button>}
        <select className={input} value={o.order_status} onChange={(e) => run(o.id, { action: 'set_status', status: e.target.value })}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        {o.payment_status === 'paid' && !['refunded'].includes(o.order_status) && <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => confirm('Mark as refunded? Only do this after refunding the customer.') && run(o.id, { action: 'mark_refunded' })}>Mark refunded</button>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <input className={input} placeholder="Courier" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
        <input className={input} placeholder="Tracking no." value={tn} onChange={(e) => setTn(e.target.value)} />
        <button className="rounded-md border px-3 py-1.5 text-sm" disabled={!carrier || !tn} onClick={() => run(o.id, { action: 'tracking', carrier, trackingNumber: tn })}>Save tracking</button>
      </div>
    </div>
  )
}

function Products() {
  const { data, loading, error, reload } = useAdmin((token) => adminListProducts({ data: { token } }))
  const [msg, setMsg] = useState('')
  const saveStock = async (id: string, qty: number) => {
    setMsg('')
    try { await act((token) => adminAdjustStock({ data: { token, productId: id, newQty: qty, note: 'Admin dashboard' } })); await reload() } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }
  const saveProduct = async (p: any, patch: any) => {
    setMsg('')
    try {
      await act((token) => adminSaveProduct({ data: {
        token, id: p.id, sku: p.sku, slug: p.slug, name: p.name, description: p.description ?? undefined, shortDescription: p.short_description ?? undefined,
        sizeMl: p.size_ml, price: Number(p.price_inr), mrp: p.mrp_inr == null ? null : Number(p.mrp_inr),
        discountPrice: p.discount_price_inr == null ? null : Number(p.discount_price_inr),
        isActive: p.is_active, isFeatured: p.is_featured, isBestseller: p.is_bestseller, lowStockThreshold: p.low_stock_threshold, ...patch,
      } }))
      await reload()
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Changes here update the live store. Customers cannot buy more than the stock you set.</p>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      <State loading={loading} error={error} />
      {data?.map((p: any) => <ProductRow key={p.id} p={p} saveStock={saveStock} saveProduct={saveProduct} />)}
    </div>
  )
}

function ProductRow({ p, saveStock, saveProduct }: { p: any; saveStock: (id: string, q: number) => void; saveProduct: (p: any, patch: any) => void }) {
  const [stock, setStock] = useState(String(p.stock_qty))
  const [price, setPrice] = useState(String(p.price_inr))
  const [disc, setDisc] = useState(p.discount_price_inr == null ? '' : String(p.discount_price_inr))
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold">{p.name} <span className="text-xs font-normal text-gray-500">{p.sku} · {p.size_ml} ml · {p.product_categories?.name ?? 'No category'}</span></p>
        <b className={p.stock_qty === 0 ? 'text-red-600' : p.stock_qty <= p.low_stock_threshold ? 'text-amber-600' : 'text-green-700'}>{p.stock_qty === 0 ? 'Out of stock' : `${p.stock_qty} in stock`}</b>
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-3 text-sm">
        <label>Stock<br /><input className={`${input} w-24`} type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} /></label>
        <button className={btn} onClick={() => saveStock(p.id, Number(stock))}>Update stock</button>
        <label>Price ₹<br /><input className={`${input} w-24`} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label>Discount price ₹<br /><input className={`${input} w-28`} type="number" min={0} value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="none" /></label>
        <button className={btn} onClick={() => saveProduct(p, { price: Number(price), discountPrice: disc === '' ? null : Number(disc) })}>Save price</button>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm">
        <label><input type="checkbox" checked={p.is_active} onChange={(e) => saveProduct(p, { isActive: e.target.checked })} /> Active (visible &amp; purchasable)</label>
        <label><input type="checkbox" checked={p.is_featured} onChange={(e) => saveProduct(p, { isFeatured: e.target.checked })} /> Featured</label>
        <label><input type="checkbox" checked={p.is_bestseller} onChange={(e) => saveProduct(p, { isBestseller: e.target.checked })} /> Best seller</label>
      </div>
    </div>
  )
}

function Customers() {
  const [q, setQ] = useState('')
  const { data, loading, error } = useAdmin((token) => adminListCustomers({ data: { token, q: q || undefined } }), [q])
  return (
    <div className="space-y-3">
      <input className={input} placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      <State loading={loading} error={error} />
      {data?.map((c: any) => <div key={c.id} className={card}><b>{c.full_name || 'Unnamed'}</b> · {c.phone || 'no phone'} · joined {new Date(c.created_at).toLocaleDateString('en-IN')}</div>)}
      {data && !data.length && <p className="text-sm text-gray-500">No registered customers yet.</p>}
    </div>
  )
}

function Enquiries() {
  const { data, loading, error, reload } = useAdmin((token) => adminListEnquiries({ data: { token } }))
  return (
    <div className="space-y-3">
      <State loading={loading} error={error} />
      {data?.map((e: any) => <EnquiryCard key={e.id} e={e} reload={reload} />)}
      {data && !data.length && <p className="text-sm text-gray-500">No enquiries yet.</p>}
    </div>
  )
}
function EnquiryCard({ e, reload }: { e: any; reload: () => void }) {
  const [notes, setNotes] = useState(e.admin_notes ?? '')
  const set = async (status: 'new' | 'contacted' | 'closed') => { await act((token) => adminUpdateEnquiry({ data: { token, id: e.id, status, notes } })); reload() }
  return (
    <div className={card}>
      <p className="font-semibold">{e.name} · {e.phone}{e.email ? ` · ${e.email}` : ''} <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">{e.status}</span></p>
      <p className="mt-1 whitespace-pre-wrap text-sm">{e.message}</p>
      <textarea className={`${input} mt-2 w-full`} placeholder="Internal notes / reply summary" value={notes} onChange={(x) => setNotes(x.target.value)} />
      <div className="mt-2 flex gap-2"><button className={btn} onClick={() => set('contacted')}>Mark contacted</button><button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => set('closed')}>Close</button></div>
    </div>
  )
}

function Coupons() {
  const { data, loading, error, reload } = useAdmin((token) => adminListCoupons({ data: { token } }))
  const [f, setF] = useState({ code: '', type: 'percent' as 'percent' | 'fixed', value: '10', min: '0', expires: '' })
  const [msg, setMsg] = useState('')
  const create = async () => {
    setMsg('')
    try {
      await act((token) => adminSaveCoupon({ data: { token, code: f.code, discountType: f.type, discountValue: Number(f.value), minOrderValue: Number(f.min), expiresAt: f.expires ? new Date(f.expires).toISOString() : null, isActive: true } }))
      setF({ ...f, code: '' }); await reload()
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }
  const toggle = async (c: any) => {
    await act((token) => adminSaveCoupon({ data: { token, id: c.id, code: c.code, discountType: c.discount_type, discountValue: Number(c.discount_value), minOrderValue: Number(c.min_order_value), maxDiscount: c.max_discount == null ? null : Number(c.max_discount), expiresAt: c.expires_at, usageLimit: c.usage_limit, isActive: !c.is_active } }))
    await reload()
  }
  return (
    <div className="space-y-3">
      <div className={`${card} flex flex-wrap items-end gap-2 text-sm`}>
        <label>Code<br /><input className={input} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></label>
        <label>Type<br /><select className={input} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as 'percent' | 'fixed' })}><option value="percent">% off</option><option value="fixed">₹ off</option></select></label>
        <label>Value<br /><input className={`${input} w-20`} type="number" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></label>
        <label>Min order ₹<br /><input className={`${input} w-24`} type="number" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} /></label>
        <label>Expires<br /><input className={input} type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></label>
        <button className={btn} disabled={f.code.length < 3} onClick={create}>Create coupon</button>
      </div>
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      <State loading={loading} error={error} />
      {data?.map((c: any) => <div key={c.id} className={`${card} flex items-center justify-between text-sm`}><span><b>{c.code}</b> · {c.discount_type === 'percent' ? `${c.discount_value}%` : inr(c.discount_value)} off · min {inr(c.min_order_value)} · used {c.used_count}{c.expires_at ? ` · expires ${new Date(c.expires_at).toLocaleDateString('en-IN')}` : ''}</span><button className="rounded-md border px-3 py-1" onClick={() => toggle(c)}>{c.is_active ? 'Disable' : 'Enable'}</button></div>)}
    </div>
  )
}

function Settings() {
  const { data, loading, error, reload } = useAdmin((token) => adminGetSettings({ data: { token } }))
  const [msg, setMsg] = useState('')
  const s = Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, any>
  const save = async (key: any, value: number | boolean) => {
    setMsg('')
    try { await act((token) => adminSaveSetting({ data: { token, key, value } })); await reload() } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed') }
  }
  const num = (key: string, label: string) => <NumSetting key={key} label={label} value={s[key]} onSave={(v) => save(key, v)} />
  const bool = (key: string, label: string, help?: string) => (
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={s[key] === true} onChange={(e) => save(key, e.target.checked)} /><span><b>{label}</b>{help && <span className="block text-gray-500">{help}</span>}</span></label>
  )
  return (
    <div className={`${card} space-y-4`}>
      <State loading={loading} error={error} />
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-4">{num('delivery_fee', 'Delivery charge (₹)')}{num('free_delivery_above', 'Free delivery above (₹, 0 = never)')}{num('gst_rate_percent', 'GST rate (%) — informational')}</div>
          {bool('upi_qr_enabled', 'UPI QR payment (manual verification)')}
          {bool('razorpay_enabled', 'Razorpay online payment', 'Only takes effect once Razorpay keys are set on the server.')}
          {bool('cod_enabled', 'Cash on Delivery')}
        </>
      )}
    </div>
  )
}
function NumSetting({ label, value, onSave }: { label: string; value: unknown; onSave: (v: number) => void }) {
  const [v, setV] = useState(String(value ?? 0))
  return <label className="text-sm">{label}<br /><span className="flex gap-2"><input className={`${input} w-28`} type="number" min={0} value={v} onChange={(e) => setV(e.target.value)} /><button className={btn} onClick={() => onSave(Number(v))}>Save</button></span></label>
}
