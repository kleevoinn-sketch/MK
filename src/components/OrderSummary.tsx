import { inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { ShieldCheck } from 'lucide-react'

export function PriceDetails({ children }: { children?: React.ReactNode }) {
  const { count, subtotal, mrpTotal, delivery, total } = useCart()
  const savings = mrpTotal - subtotal
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-40">
      <h2 className="border-b border-gray-200 px-5 py-3 text-sm font-bold uppercase tracking-wide text-gray-500">Price Details</h2>
      <dl className="space-y-3 px-5 py-4 text-[15px]">
        <div className="flex justify-between"><dt>Price ({count} item{count === 1 ? '' : 's'})</dt><dd>{inr(mrpTotal)}</dd></div>
        {savings > 0 && <div className="flex justify-between"><dt>Discount</dt><dd className="text-emerald-600">− {inr(savings)}</dd></div>}
        <div className="flex justify-between"><dt>Delivery Charges</dt><dd className="text-emerald-600">{delivery ? inr(delivery) : 'FREE'}</dd></div>
        <div className="flex justify-between border-t border-dashed border-gray-300 pt-3 text-lg font-bold"><dt>Total Amount</dt><dd>{inr(total)}</dd></div>
      </dl>
      {savings > 0 && <p className="border-t border-gray-100 px-5 py-3 text-sm font-semibold text-emerald-600">You will save {inr(savings)} on this order</p>}
      {children && <div className="border-t border-gray-100 px-5 py-4">{children}</div>}
      <p className="flex items-center gap-2 px-5 pb-4 text-xs text-gray-500">
        <ShieldCheck className="h-4 w-4 text-gray-400" /> Safe and secure prepaid payments. 100% authentic products.
      </p>
    </div>
  )
}
