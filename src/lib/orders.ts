import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { DELIVERY_FEE, getProduct } from '@/data/products'

const phone = z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')

const orderInput = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1).max(60), quantity: z.number().int().min(1).max(50) }))
    .min(1)
    .max(20),
  paymentReference: z.string().trim().min(6).max(40),
  delivery: z.object({
    customerName: z.string().trim().min(2).max(80),
    phone,
    alternatePhone: z.union([phone, z.literal('')]).optional(),
    email: z.union([z.string().trim().email().max(120), z.literal('')]).optional(),
    addressLine1: z.string().trim().min(5).max(200),
    addressLine2: z.string().trim().max(200).optional(),
    landmark: z.string().trim().max(120).optional(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code'),
  }),
})

export type OrderInput = z.infer<typeof orderInput>

function makeOrderNumber() {
  const d = new Date()
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(100000 + Math.random() * 900000)
  return `KLV${ymd}${rand}`
}

export const placeOrder = createServerFn({ method: 'POST' })
  .validator(orderInput)
  .handler(async ({ data }) => {
    const { db } = await import('../../db/index.js')
    const { orders } = await import('../../db/schema.js')

    const items = data.items.map((i) => {
      const p = getProduct(i.productId)
      if (!p) throw new Error('Unknown product in cart')
      return { productId: p.id, name: p.name, size: p.size, price: p.price, quantity: i.quantity }
    })
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
    const total = subtotal + DELIVERY_FEE
    const d = data.delivery

    const [row] = await db
      .insert(orders)
      .values({
        orderNumber: makeOrderNumber(),
        customerName: d.customerName,
        phone: d.phone,
        alternatePhone: d.alternatePhone || null,
        email: d.email || null,
        addressLine1: d.addressLine1,
        addressLine2: d.addressLine2 || null,
        landmark: d.landmark || null,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        items,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        paymentReference: data.paymentReference.toUpperCase(),
      })
      .returning({ orderNumber: orders.orderNumber })

    return { orderNumber: row.orderNumber }
  })

export const getOrder = createServerFn({ method: 'GET' })
  .validator(z.object({ orderNumber: z.string().trim().min(5).max(40) }))
  .handler(async ({ data }) => {
    const { db } = await import('../../db/index.js')
    const { orders } = await import('../../db/schema.js')
    const { eq } = await import('drizzle-orm')
    const [o] = await db.select().from(orders).where(eq(orders.orderNumber, data.orderNumber)).limit(1)
    if (!o) return null
    return {
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      phone: o.phone.replace(/^(\d{2})\d{5}(\d{3})$/, '$1•••••$2'),
      city: o.city,
      state: o.state,
      pincode: o.pincode,
      items: o.items,
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      total: o.total,
      paymentReference: o.paymentReference,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }
  })
