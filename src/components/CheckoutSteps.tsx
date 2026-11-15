import { Check } from 'lucide-react'

const steps = ['Cart', 'Payment', 'Order Confirmation', 'Delivery Details', 'Order Placed']

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="mx-auto mb-6 flex max-w-4xl items-center px-2">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  done ? 'bg-emerald-600 text-white' : active ? 'bg-[#1347b8] text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`hidden text-center text-xs font-medium sm:block ${active ? 'text-[#1347b8]' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <span className={`mx-1 mb-0 h-0.5 flex-1 sm:mb-5 ${done ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
          </li>
        )
      })}
    </ol>
  )
}
