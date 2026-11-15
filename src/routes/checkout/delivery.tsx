import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Loader2, MapPin, Truck } from 'lucide-react'
import { inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { placeOrder } from '@/lib/orders'
import { getToken } from '@/lib/auth'
import { getPaymentOptions, startRazorpayPayment, verifyRazorpayPayment } from '@/lib/razorpay'
import { CheckoutSteps } from '@/components/CheckoutSteps'
import { PriceDetails } from '@/components/OrderSummary'
import { EmptyCart } from '@/components/EmptyCart'

export const Route = createFileRoute('/checkout/delivery')({
  head: () => ({ meta: [{ title: 'Delivery Details | KLEEVO' }] }),
  component: DeliveryPage,
})

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
]

type Form = {
  customerName: string; phone: string; alternatePhone: string; email: string
  addressLine1: string; addressLine2: string; landmark: string; city: string; state: string; pincode: string
}
const empty: Form = { customerName: '', phone: '', alternatePhone: '', email: '', addressLine1: '', addressLine2: '', landmark: '', city: '', state: 'Karnataka', pincode: '' }

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.customerName.trim().length < 2) e.customerName = 'Enter your full name'
  if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
  if (f.alternatePhone.trim() && !/^[6-9]\d{9}$/.test(f.alternatePhone.trim())) e.alternatePhone = 'Enter a valid 10-digit number'
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email'
  if (f.addressLine1.trim().length < 5) e.addressLine1 = 'Enter house no., building and street'
  if (f.city.trim().length < 2) e.city = 'Enter your city / town'
  if (!f.state) e.state = 'Select your state'
  if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code'
  return e
}

function DeliveryPage() {
  const cart = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState<Form>(empty)
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [razorpayOn, setRazorpayOn] = useState(false)
  useEffect(() => {
    getPaymentOptions().then((o) => setRazorpayOn(o.razorpay)).catch(() => setRazorpayOn(false))
  }, [])

  if (!cart.ready) return <div className="py-24 text-center text-gray-400">Loading…</div>
  if (!cart.lines.length) return <div className="px-3 py-6"><CheckoutSteps current={3} /><EmptyCart /></div>
  const manualPaid = Boolean(cart.paymentReference && cart.orderReviewed)
  if (!manualPaid && !razorpayOn) {
    return (
      <div className="mx-auto max-w-xl px-3 py-16 text-center">
        <p className="text-gray-600">Please complete payment and confirm your order first.</p>
        <Link to={cart.paymentReference ? '/checkout/confirm' : '/checkout/payment'} className="mt-4 inline-block rounded-md bg-[#fb641b] px-6 py-3 font-bold text-white">Continue</Link>
      </div>
    )
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    setServerError('')
    try {
      const accessToken = (await getToken()) ?? undefined
      const res = await placeOrder({
        data: {
          accessToken,
          items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          paymentReference: cart.paymentReference,
          delivery: {
            ...form,
            customerName: form.customerName.trim(),
            phone: form.phone.trim(),
            alternatePhone: form.alternatePhone.trim(),
            email: form.email.trim(),
            pincode: form.pincode.trim(),
          },
        },
      })
      await navigate({ to: '/order/$orderNumber', params: { orderNumber: res.orderNumber } })
      cart.clear()
    } catch (err) {
      const m = err instanceof Error ? err.message : ''
      if (/stock|unavailable|coupon|Too many/i.test(m)) {
        setServerError(m)
        setSubmitting(false)
        return
      }
      setServerError('We could not place your order right now. Please try again, or call / WhatsApp us and we will help you.')
      setSubmitting(false)
    }
  }

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve()
      const el = document.createElement('script')
      el.src = 'https://checkout.razorpay.com/v1/checkout.js'
      el.onload = () => resolve()
      el.onerror = () => reject(new Error('Could not load the payment window'))
      document.body.appendChild(el)
    })

  const payOnline = async () => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    setServerError('')
    try {
      const accessToken = (await getToken()) ?? undefined
      const [start] = await Promise.all([
        startRazorpayPayment({
          data: {
            accessToken,
            items: cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
            delivery: { ...form, customerName: form.customerName.trim(), phone: form.phone.trim(), alternatePhone: form.alternatePhone.trim(), email: form.email.trim(), pincode: form.pincode.trim() },
          },
        }),
        loadRazorpay(),
      ])
      const rzp = new (window as any).Razorpay({
        key: start.keyId,
        order_id: start.razorpayOrderId,
        amount: start.amountPaise,
        currency: 'INR',
        name: 'KLEEVO',
        description: `Order ${start.orderNumber}`,
        prefill: { name: form.customerName, contact: form.phone, email: form.email },
        theme: { color: '#1347b8' },
        modal: { ondismiss: () => { setSubmitting(false); setServerError('Payment was not completed. You can try again.') } },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await verifyRazorpayPayment({ data: r })
            await navigate({ to: '/order/$orderNumber', params: { orderNumber: start.orderNumber } })
            cart.clear()
          } catch {
            setServerError(`We could not confirm your payment yet. If money was debited, do not pay again — quote order ${start.orderNumber} when you call or WhatsApp us.`)
            setSubmitting(false)
          }
        },
      })
      rzp.open()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Could not start online payment')
      setSubmitting(false)
    }
  }

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, span = false) => (
    <div className={span ? 'sm:col-span-2' : ''}>
      <label htmlFor={k} className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        id={k}
        value={form[k]}
        onChange={set(k)}
        className={`h-12 w-full rounded-md border px-3 text-base outline-none focus:ring-2 ${errors[k] ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:border-[#1347b8] focus:ring-blue-100'}`}
        {...props}
      />
      {errors[k] && <p className="mt-1 text-xs font-medium text-red-600">{errors[k]}</p>}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <CheckoutSteps current={3} />
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate className="rounded-xl bg-white shadow-sm">
          <h1 className="flex items-center gap-2 border-b border-gray-200 bg-[#1347b8] px-5 py-4 text-lg font-bold text-white rounded-t-xl">
            <MapPin className="h-5 w-5" /> Delivery Address
          </h1>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {field('customerName', 'Full Name *', { autoComplete: 'name', placeholder: 'Name of the receiver' })}
            {field('phone', '10-digit Mobile Number *', { autoComplete: 'tel-national', inputMode: 'numeric', maxLength: 10, placeholder: 'For delivery updates' })}
            {field('addressLine1', 'House No., Building, Street *', { autoComplete: 'address-line1' }, true)}
            {field('addressLine2', 'Area, Colony, Locality', { autoComplete: 'address-line2' }, true)}
            {field('landmark', 'Landmark (optional)', { placeholder: 'e.g. Near bus stand' })}
            {field('pincode', 'PIN Code *', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 })}
            {field('city', 'City / Town / District *', { autoComplete: 'address-level2' })}
            <div>
              <label htmlFor="state" className="mb-1 block text-sm font-semibold text-gray-700">State *</label>
              <select id="state" value={form.state} onChange={set('state')} className="h-12 w-full rounded-md border border-gray-300 bg-white px-3 text-base outline-none focus:border-[#1347b8] focus:ring-2 focus:ring-blue-100">
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            {field('alternatePhone', 'Alternate Phone (optional)', { inputMode: 'numeric', maxLength: 10 })}
            {field('email', 'Email (optional)', { type: 'email', autoComplete: 'email' })}
          </div>
          {serverError && <p className="mx-5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{serverError}</p>}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-5 py-4">
            <span className="flex items-center gap-2 text-sm text-gray-600"><Truck className="h-5 w-5 text-[#1347b8]" /> {manualPaid ? `Prepaid · UTR ${cart.paymentReference}` : 'Pay securely online'}</span>
            <div className="flex flex-wrap gap-2">
              {razorpayOn && (
                <button type="button" onClick={payOnline} disabled={submitting} className="flex items-center gap-2 rounded-md bg-[#1347b8] px-6 py-3.5 font-bold text-white shadow hover:bg-[#0f3a99] disabled:opacity-70">
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />} PAY ONLINE · {inr(cart.total)}
                </button>
              )}
              {manualPaid && (
                <button disabled={submitting} className="flex items-center gap-2 rounded-md bg-[#fb641b] px-8 py-3.5 font-bold text-white shadow hover:bg-[#ec5810] disabled:opacity-70">
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {submitting ? 'PLACING ORDER…' : `PLACE ORDER · ${inr(cart.total)}`}
                </button>
              )}
            </div>
          </div>
        </form>
        <PriceDetails />
      </div>
    </div>
  )
}
