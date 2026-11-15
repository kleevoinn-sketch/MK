import { Link } from '@tanstack/react-router'
import { ShoppingBag } from 'lucide-react'

export function EmptyCart() {
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white px-6 py-16 text-center shadow-sm">
      <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
      <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
      <p className="mt-1 text-gray-500">Add KLEEVO products to your cart to place an order.</p>
      <Link to="/" hash="products" className="mt-6 inline-block rounded-md bg-[#fb641b] px-8 py-3 font-bold text-white hover:bg-[#ec5810]">Shop Now</Link>
    </div>
  )
}
