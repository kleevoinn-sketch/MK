import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Download, Lock, Smartphone } from 'lucide-react'
import { BRAND, img, inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { PriceDetails } from '@/components/OrderSummary'
import { WhatsAppLogo } from '@/components/BrandIcons'
import { EmptyCart } from '@/components/EmptyCart'

export const Route = createFileRoute('/checkout/payment')({
  head: () => ({ meta: [{ title: 'Payment | KLEEVO' }] }),
  component: PaymentPage,
})

function PaymentPage() {
  const { ready, lines, total, paymentReference, setPaymentReference, setOrderReviewed } = useCart()
  const navigate = useNavigate()
  const [ref, setRef] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState('')
  const value = ref ?? paymentReference

  if (!ready) return <div className="py-24 text-center text-gray-400">Loading…</div>
  if (!lines.length) return <div className="px-3 py-6"><CheckoutSteps current={1} /><EmptyCart /></div>

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = value.trim().replace(/\s+/g, '')
    if (!/^[A-Za-z0-9]{6,40}$/.test(clean)) return setError('Enter the UPI transaction / UTR number shown in your payment app (usually 12 digits).')
    if (!paid) return setError('Please confirm that you have completed the payment.')
    setPaymentReference(clean)
    setOrderReviewed(false)
    navigate({ to: '/checkout/confirm' })
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <CheckoutSteps current={1} />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h1 className="flex items-center gap-2 text-lg font-bold"><Lock className="h-5 w-5 text-emerald-600" /> Prepaid Payment · UPI QR</h1>
            <Link to="/cart" className="flex items-center gap-1 text-sm font-semibold text-[#1347b8]"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
          </div>
          <div className="grid gap-6 p-5 md:grid-cols-[300px_1fr]">
            <div className="text-center">
              <div className="rounded-2xl border-2 border-dashed border-[#1347b8]/40 bg-blue-50/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1347b8]">Scan &amp; Pay</p>
                <img src={img('/img/upi-qr.jpg', 600)} alt="KLEEVO UPI payment QR code" className="mx-auto mt-2 w-full max-w-[260px] rounded-lg bg-white p-2 shadow" />
                <p className="mt-3 text-sm text-gray-600">Amount to pay</p>
                <p className="font-display text-3xl font-extrabold text-gray-900">{inr(total)}</p>
              </div>
              <a href="/img/upi-qr.jpg" download="kleevo-upi-qr.jpg" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1347b8] hover:underline">
                <Download className="h-4 w-4" /> Download QR
              </a>
              <p className="mt-2 text-xs text-gray-500">Accepted on Google Pay · PhonePe · Paytm · BHIM · any UPI app</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <ol className="space-y-3 text-sm text-gray-700">
                {[
                  'Open any UPI app on your phone and choose “Scan QR”.',
                  <>Scan the QR code and pay exactly <strong>{inr(total)}</strong>.</>,
                  'Copy the UPI transaction ID / UTR number from the payment success screen.',
                  'Enter it below and continue to confirm your order.',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1347b8] text-xs font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>

              <div>
                <label htmlFor="utr" className="mb-1 block text-sm font-semibold text-gray-700">UPI Transaction ID / UTR Number *</label>
                <div className="flex items-center rounded-md border border-gray-300 focus-within:border-[#1347b8] focus-within:ring-2 focus-within:ring-blue-100">
                  <Smartphone className="ml-3 h-5 w-5 text-gray-400" />
                  <input
                    id="utr"
                    value={value}
                    onChange={(e) => { setRef(e.target.value); setError('') }}
                    placeholder="e.g. 431298765432"
                    inputMode="text"
                    autoComplete="off"
                    className="h-12 w-full rounded-md px-3 text-base tracking-wider outline-none"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-md bg-gray-50 p-3 text-sm">
                <input type="checkbox" checked={paid} onChange={(e) => { setPaid(e.target.checked); setError('') }} className="mt-0.5 h-5 w-5 accent-[#1347b8]" />
                <span>I have paid <strong>{inr(total)}</strong> to KLEEVO using the QR code above.</span>
              </label>

              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

              <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#fb641b] py-4 text-base font-bold text-white shadow hover:bg-[#ec5810]">
                <CheckCircle2 className="h-5 w-5" /> I HAVE PAID · CONTINUE
              </button>

              <a href={`https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent(`Hi KLEEVO, I have paid ${inr(total)} for my order. Sharing the payment screenshot.`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
                <WhatsAppLogo className="h-5 w-5" /> Facing an issue? Send your payment screenshot on WhatsApp
              </a>
            </form>
          </div>
        </div>
        <PriceDetails />
      </div>
    </div>
  )
}
