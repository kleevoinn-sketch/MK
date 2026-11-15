import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, BadgeCheck, Pencil } from 'lucide-react'
import { img, inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { PriceDetails } from '@/components/OrderSummary'
import { EmptyCart } from '@/components/EmptyCart'

export const Route = createFileRoute('/checkout/confirm')({
  head: () => ({ meta: [{ title: 'Order Confirmation | KLEEVO' }] }),
  component: ConfirmPage,
})

function ConfirmPage() {
  const { ready, lines, total, paymentReference, setOrderReviewed } = useCart()
  const navigate = useNavigate()

  if (!ready) return <div className="py-24 text-center text-gray-400">Loading…</div>
  if (!lines.length) return <div className="px-3 py-6"><CheckoutSteps current={2} /><EmptyCart /></div>
  if (!paymentReference) {
    return (
      <div className="mx-auto max-w-xl px-3 py-16 text-center">
        <p className="text-gray-600">Please complete the payment first.</p>
        <Link to="/checkout/payment" className="mt-4 inline-block rounded-md bg-[#fb641b] px-6 py-3 font-bold text-white">Go to Payment</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <CheckoutSteps current={2} />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <BadgeCheck className="h-8 w-8 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <h1 className="text-lg font-bold text-emerald-900">Payment details received</h1>
              <p className="text-sm text-emerald-800">
                Amount <strong>{inr(total)}</strong> · UPI Ref / UTR <strong className="tracking-wider">{paymentReference}</strong>
              </p>
              <p className="mt-1 text-xs text-emerald-700">Our team verifies every payment before dispatch.</p>
            </div>
            <Link to="/checkout/payment" className="flex items-center gap-1 text-sm font-semibold text-[#1347b8]"><Pencil className="h-4 w-4" /> Edit</Link>
          </div>

          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold">Confirm Your Order</h2>
              <Link to="/cart" className="flex items-center gap-1 text-sm font-semibold text-[#1347b8]"><ArrowLeft className="h-4 w-4" /> Edit cart</Link>
            </div>
            <ul className="divide-y divide-gray-100">
              {lines.map(({ product: p, quantity }) => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <img src={img(p.image, 140)} alt={p.name} className="h-16 w-16 rounded border border-gray-100 object-contain" />
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.size} · Qty {quantity} × {inr(p.price)}</p>
                  </div>
                  <span className="font-bold">{inr(p.price * quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4">
              <span className="text-lg font-bold">Order Total: {inr(total)}</span>
              <button
                onClick={() => { setOrderReviewed(true); navigate({ to: '/checkout/delivery' }) }}
                className="rounded-md bg-[#fb641b] px-8 py-3.5 font-bold text-white shadow hover:bg-[#ec5810]"
              >
                CONFIRM ORDER
              </button>
            </div>
          </div>
        </div>
        <PriceDetails />
      </div>
    </div>
  )
}
