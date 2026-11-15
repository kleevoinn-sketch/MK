import { Link, useNavigate } from '@tanstack/react-router'
import { ShoppingCart, Zap } from 'lucide-react'
import { img, inr, type Product } from '@/data/products'
import { useCart } from '@/lib/cart'

export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useCart()
  const navigate = useNavigate()
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0

  return (
    <div className="group flex flex-col rounded-xl border border-gray-200 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-xl sm:p-4">
      <Link to="/products/$productId" params={{ productId: p.id }} className="relative block overflow-hidden rounded-lg bg-gray-50">
        {off > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white">{off}% OFF</span>
        )}
        <span className="absolute right-2 top-2 z-10 rounded bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-700 shadow-sm">{p.size}</span>
        <img
          src={img(p.image, 480)}
          alt={`${p.name} ${p.size} bottle`}
          loading="lazy"
          className="aspect-square w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="mt-3 flex flex-1 flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: p.accent }}>{p.category}</span>
        <Link to="/products/$productId" params={{ productId: p.id }} className="mt-0.5 line-clamp-2 font-semibold text-gray-900 hover:text-[#1347b8]">
          {p.name} <span className="font-normal text-gray-500">({p.size})</span>
        </Link>
        <p className="mt-1 line-clamp-2 text-[13px] text-gray-500">{p.shortDescription}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900">{inr(p.price)}</span>
          {off > 0 && <span className="text-sm text-gray-400 line-through">M.R.P. {inr(p.mrp)}</span>}
        </div>
        <span className="text-[11px] text-gray-500">Inclusive of all taxes</span>
        <div className="mt-3 grid grid-cols-2 gap-2 pt-1 sm:mt-auto">
          <button
            onClick={() => add(p.id)}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#ff9f00] px-2 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#f39200]"
          >
            <ShoppingCart className="h-4 w-4" /> ADD TO CART
          </button>
          <button
            onClick={() => {
              add(p.id)
              navigate({ to: '/cart' })
            }}
            className="flex items-center justify-center gap-1.5 rounded-md bg-[#fb641b] px-2 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-[#ec5810]"
          >
            <Zap className="h-4 w-4" /> ORDER NOW
          </button>
        </div>
      </div>
    </div>
  )
}
