import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const phone = z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')

export const deliverySchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone,
  alternatePhone: z.union([phone, z.literal('')]).optional(),
  email: z.union([z.string().trim().email().max(120), z.literal('')]).optional(),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  landmark: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
  instructions: z.string().trim().max(500).optional(),
})

export const cartItemsSchema = z
  .array(z.object({ productId: z.string().min(1).max(60), quantity: z.number().int().min(1).max(50) }))
  .min(1)
  .max(20)

const orderInput = z.object({
  items: cartItemsSchema,
  paymentReference: z.string().trim().min(6).max(40),
  couponCode: z.string().trim().max(40).optional(),
  accessToken: z.string().max(4000).optional(),
  delivery: deliverySchema,
})

export type OrderInput = z.infer<typeof orderInput>

// ---- best-effort per-IP rate limit (per server instance; add an edge rule for hard limits) ----
const hits = new Map<string, Array<number>>()
export async function rateLimit(bucket: string, max: number, windowMs: number) {
  let ip = 'unknown'
  try {
    const { getRequestHeader } = await import('@tanstack/react-start/server')
    ip = getRequestHeader('x-nf-client-connection-ip') || getRequestHeader('x-forwarded-for')?.split(',')[0] || 'unknown'
  } catch {
    /* header helper unavailable */
  }
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (recent.length >= max) throw new Error('Too many requests. Please wait a minute and try again.')
  recent.push(now)
  hits.set(key, recent)
}

/** Resolve cart product slugs to SKUs. Prices are NEVER taken from the browser; the DB computes them. */
export async function toSkuLines(items: z.infer<typeof cartItemsSchema>) {
  const { select } = await import('./supabase.server')
  const slugs = [...new Set(items.map((i) => i.productId))]
  const rows = await select<{ sku: string; slug: string }>('products', {
    select: 'sku,slug',
    slug: `in.(${slugs.map((s) => `"${s.replace(/"/g, '')}"`).join(',')})`,
  })
  const bySlug = new Map(rows.map((r) => [r.slug, r.sku]))
  return items.map((i) => {
    const sku = bySlug.get(i.productId)
    if (!sku) throw new Error('A product in your cart is no longer available')
    return { sku, qty: i.quantity }
  })
}

export async function createDbOrder(
  d: z.infer<typeof deliverySchema>,
  items: z.infer<typeof cartItemsSchema>,
  method: 'upi_qr' | 'razorpay' | 'cod',
  couponCode: string | undefined,
  accessToken: string | undefined,
) {
  const { rpc, getUser } = await import('./supabase.server')
  const user = await getUser(accessToken)
  const rows = await rpc<Array<{ order_id: string; order_number: string; total: number }>>('create_order', {
    p_user: user?.id ?? null,
    p_name: d.customerName,
    p_phone: d.phone,
    p_alt_phone: d.alternatePhone || null,
    p_email: d.email || null,
    p_line1: d.addressLine1,
    p_line2: d.addressLine2 || null,
    p_landmark: d.landmark || null,
    p_city: d.city,
    p_state: d.state,
    p_pincode: d.pincode,
    p_instructions: d.instructions || null,
    p_method: method,
    p_items: await toSkuLines(items),
    p_coupon: couponCode || null,
  })
  const row = rows[0] as { order_id: string; order_number: string; total: number } | undefined
  if (!row) throw new Error('Order could not be created')
  return { orderId: row.order_id, orderNumber: row.order_number, total: Number(row.total) }
}

/** Manual UPI QR flow: order is saved awaiting admin payment verification. */
export const placeOrder = createServerFn({ method: 'POST' })
  .validator(orderInput)
  .handler(async ({ data }) => {
    await rateLimit('place-order', 8, 60_000)
    const { update } = await import('./supabase.server')
    const o = await createDbOrder(data.delivery, data.items, 'upi_qr', data.couponCode, data.accessToken)
    await update('orders', { id: `eq.${o.orderId}` }, {
      payment_reference: data.paymentReference.toUpperCase(),
      payment_status: 'verification',
    })
    return { orderNumber: o.orderNumber }
  })

/** Public order lookup by order number (contact details masked). */
export const getOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ orderNumber: z.string().trim().min(5).max(40) }))
  .handler(async ({ data }) => {
    await rateLimit('get-order', 30, 60_000)
    const { select } = await import('./supabase.server')
    const [o] = await select<Record<string, any>>('orders', {
      select: '*,order_items(product_name,quantity,unit_price,products(size_ml,slug))',
      order_number: `eq.${data.orderNumber}`,
      limit: '1',
    })
    if (!o) return null
    const status =
      o.payment_status === 'verification' && o.order_status === 'pending' ? 'payment_verification' : o.order_status
    return {
      orderNumber: o.order_number as string,
      customerName: o.customer_name as string,
      phone: String(o.phone).replace(/^(\d{2})\d{5}(\d{3})$/, '$1•••••$2'),
      city: o.city as string,
      state: o.state as string,
      pincode: o.pincode as string,
      items: (o.order_items as Array<any>).map((i) => ({
        productId: i.products?.slug ?? '',
        name: i.product_name as string,
        size: i.products?.size_ml ? `${i.products.size_ml} ml` : '',
        price: Number(i.unit_price),
        quantity: i.quantity as number,
      })),
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.delivery_fee),
      discount: Number(o.discount_amount),
      total: Number(o.total_amount),
      paymentMethod: o.payment_method as string,
      paymentStatus: o.payment_status as string,
      paymentReference: (o.payment_reference as string | null) ?? '',
      status: status as string,
      createdAt: o.created_at as string,
    }
  })
