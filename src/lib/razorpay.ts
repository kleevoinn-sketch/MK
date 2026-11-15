import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { cartItemsSchema, createDbOrder, deliverySchema, rateLimit } from './orders'

/** Which payment options are switched on (public flags + whether Razorpay keys exist on the server). */
export const getPaymentOptions = createServerFn({ method: 'GET' }).handler(async () => {
  const { select } = await import('./supabase.server')
  const { razorpayConfigured } = await import('./razorpay.server')
  const rows = await select<{ key: string; value: unknown }>('site_settings', { select: 'key,value', is_public: 'eq.true' })
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return {
    razorpay: s.razorpay_enabled === true && razorpayConfigured(),
    upiQr: s.upi_qr_enabled !== false,
    cod: s.cod_enabled === true,
  }
})

/** Creates the order in the DB (server-priced) and a Razorpay order for the exact DB total. */
export const startRazorpayPayment = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      items: cartItemsSchema,
      delivery: deliverySchema,
      couponCode: z.string().trim().max(40).optional(),
      accessToken: z.string().max(4000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await rateLimit('razorpay-start', 6, 60_000)
    const core = await import('./razorpay.server')
    if (!core.razorpayConfigured()) throw new Error('Online payment is not configured yet. Please use UPI QR payment.')
    const o = await createDbOrder(data.delivery, data.items, 'razorpay', data.couponCode, data.accessToken)
    const razorpayOrderId = await core.createRazorpayOrder(o.orderId, o.orderNumber, o.total)
    return {
      keyId: process.env.RAZORPAY_KEY_ID as string, // public key id only
      razorpayOrderId,
      amountPaise: Math.round(o.total * 100),
      orderNumber: o.orderNumber,
    }
  })

/** Called by the browser after Razorpay Checkout succeeds. Signature AND server-side status are verified. */
export const verifyRazorpayPayment = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      razorpay_order_id: z.string().min(5).max(60),
      razorpay_payment_id: z.string().min(5).max(60),
      razorpay_signature: z.string().min(20).max(200),
    }),
  )
  .handler(async ({ data }) => {
    await rateLimit('razorpay-verify', 20, 60_000)
    const core = await import('./razorpay.server')
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) throw new Error('Online payment is not configured')
    const expected = core.hmacHex(secret, `${data.razorpay_order_id}|${data.razorpay_payment_id}`)
    if (!core.safeEqualHex(expected, data.razorpay_signature)) throw new Error('Payment signature mismatch')
    await core.finalizePayment(data.razorpay_order_id, data.razorpay_payment_id)
    const { select } = await import('./supabase.server')
    const [p] = await select<{ orders: { order_number: string } }>('payments', {
      select: 'orders(order_number)',
      provider_order_id: `eq.${data.razorpay_order_id}`,
      limit: '1',
    })
    return { orderNumber: p?.orders?.order_number ?? '' }
  })
