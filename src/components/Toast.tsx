import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '@/lib/cart'

export function Toast() {
  const { toast } = useCart()
  if (!toast) return null
  return (
    <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-2xl">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        {toast}
        <Link to="/cart" className="ml-2 rounded bg-amber-400 px-3 py-1 font-bold text-gray-900 hover:bg-amber-300">View Cart</Link>
      </div>
    </div>
  )
}
