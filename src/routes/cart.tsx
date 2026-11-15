import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { EmptyCart } from '@/components/EmptyCart'
import { img, inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { PriceDetails } from '@/components/OrderSummary'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: 'Your Cart | KLEEVO' }] }),
  component: CartPage,
})

function CartPage() {
  const { ready, lines, setQty, remove, total } = useCart()
  const navigate = useNavigate()

  if (!ready) return <div className="py-24 text-center text-gray-400">Loading your cart…</div>

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <CheckoutSteps current={0} />
      {lines.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl bg-white shadow-sm">
            <h1 className="border-b border-gray-200 px-5 py-4 text-lg font-bold">My Cart ({lines.length})</h1>
            <ul className="divide-y divide-gray-100">
              {lines.map(({ product: p, quantity }) => (
                <li key={p.id} className="flex gap-4 p-5">
                  <Link to="/products/$productId" params={{ productId: p.id }} className="shrink-0">
                    <img src={img(p.image, 220)} alt={p.name} className="h-24 w-24 rounded-lg border border-gray-100 object-contain sm:h-28 sm:w-28" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link to="/products/$productId" params={{ productId: p.id }} className="font-semibold hover:text-[#1347b8]">{p.name}</Link>
                    <span className="text-sm text-gray-500">{p.labelName} · {p.size}</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-lg font-bold">{inr(p.price * quantity)}</span>
                      {p.mrp > p.price && <span className="text-sm text-gray-400 line-through">{inr(p.mrp * quantity)}</span>}
                      <span className="text-xs text-gray-500">({inr(p.price)} each)</span>
                    </div>
                    <div className="mt-auto flex items-center gap-4 pt-2">
                      <div className="flex items-center rounded-full border border-gray-300">
                        <button onClick={() => setQty(p.id, quantity - 1)} disabled={quantity <= 1} className="rounded-l-full p-2 hover:bg-gray-100 disabled:opacity-40" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                        <span className="w-9 text-center font-semibold">{quantity}</span>
                        <button onClick={() => setQty(p.id, quantity + 1)} className="rounded-r-full p-2 hover:bg-gray-100" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                      </div>
                      <button onClick={() => remove(p.id)} className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600">
                        <Trash2 className="h-4 w-4" /> REMOVE
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-5 py-4 shadow-[0_-2px_10px_rgba(0,0,0,.06)]">
              <Link to="/" hash="products" className="text-sm font-semibold text-[#1347b8] hover:underline">+ Add more items</Link>
              <button onClick={() => navigate({ to: '/checkout/payment' })} className="rounded-md bg-[#fb641b] px-8 py-3.5 font-bold text-white shadow hover:bg-[#ec5810]">
                PLACE ORDER · {inr(total)}
              </button>
            </div>
          </div>
          <PriceDetails />
        </div>
      )}
    </div>
  )
}
