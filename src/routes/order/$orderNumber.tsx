import { Link, createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Mail, PackageCheck, Phone, Truck } from 'lucide-react'
import { BRAND, getProduct, img, inr } from '@/data/products'
import { getOrder } from '@/lib/orders'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { WhatsAppLogo } from '@/components/BrandIcons'

export const Route = createFileRoute('/order/$orderNumber')({
  loader: ({ params }) => getOrder({ data: { orderNumber: params.orderNumber } }),
  head: () => ({ meta: [{ title: 'Order Placed | KLEEVO' }] }),
  component: OrderPage,
})

function OrderPage() {
  const order = Route.useLoaderData()

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="mt-2 text-gray-500">Please check your order number or contact us.</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-[#1347b8]">Back to shop</Link>
      </div>
    )
  }

  const placed = new Date(order.createdAt)
  const msg = `Hi KLEEVO, I placed order ${order.orderNumber} for ${inr(order.total)}. UPI Ref: ${order.paymentReference}.`

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
      <CheckoutSteps current={5} />
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-center text-white">
          <CheckCircle2 className="mx-auto h-16 w-16" />
          <h1 className="mt-3 text-3xl font-bold">Order Placed Successfully!</h1>
          <p className="mt-1 text-emerald-50">Thank you, {order.customerName}. Your KLEEVO order has been received.</p>
          <p className="mt-4 inline-block rounded-full bg-white/20 px-5 py-2 font-mono text-lg font-bold tracking-wider">Order ID: {order.orderNumber}</p>
        </div>

        <div className="grid gap-4 border-b border-gray-100 p-6 sm:grid-cols-3">
          {[
            { icon: CheckCircle2, t: 'Order placed', s: placed.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), on: true },
            { icon: Clock, t: 'Payment verification', s: 'We verify your UPI payment', on: true },
            { icon: Truck, t: 'Dispatch & delivery', s: 'We will call you with delivery updates', on: false },
          ].map(({ icon: Icon, t, s, on }) => (
            <div key={t} className="flex items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}><Icon className="h-5 w-5" /></span>
              <span><span className="block font-semibold">{t}</span><span className="block text-sm text-gray-500">{s}</span></span>
            </div>
          ))}
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">
          <div>
            <h2 className="mb-3 flex items-center gap-2 font-bold"><PackageCheck className="h-5 w-5 text-[#1347b8]" /> Items in this order</h2>
            <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
              {order.items.map((i) => {
                const p = getProduct(i.productId)
                return (
                  <li key={i.productId} className="flex items-center gap-3 p-3">
                    {p && <img src={img(p.image, 120)} alt="" className="h-14 w-14 rounded object-contain" />}
                    <span className="flex-1"><span className="block font-semibold">{i.name}</span><span className="text-sm text-gray-500">{i.size} · Qty {i.quantity}</span></span>
                    <span className="font-bold">{inr(i.price * i.quantity)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between"><span>Items total</span><span>{inr(order.subtotal)}</span></div>
              <div className="mt-1 flex justify-between"><span>Delivery</span><span className="text-emerald-600">{order.deliveryFee ? inr(order.deliveryFee) : 'FREE'}</span></div>
              <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold"><span>Paid (UPI)</span><span>{inr(order.total)}</span></div>
              <p className="mt-2 break-all text-xs text-gray-500">UTR: {order.paymentReference}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-semibold">Delivering to</p>
              <p className="text-gray-600">{order.customerName}<br />{order.city}, {order.state} – {order.pincode}<br />Mobile: {order.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-gray-100 bg-blue-50/50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-gray-600">Save your Order ID. For any help, contact us with your Order ID.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a href={`https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white hover:brightness-95"><WhatsAppLogo className="h-5 w-5" /> Share on WhatsApp</a>
            <a href={`tel:+91${BRAND.phones[0]}`} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"><Phone className="h-4 w-4" /> Call</a>
            <a href={`mailto:${BRAND.email}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`} className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-50"><Mail className="h-4 w-4" /> Email</a>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link to="/" hash="products" className="inline-block rounded-md bg-[#fb641b] px-8 py-3 font-bold text-white hover:bg-[#ec5810]">Continue Shopping</Link>
      </div>
    </div>
  )
}
