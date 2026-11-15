import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { rateLimit } from './orders'

const tok = z.string().min(20).max(4000)
const sb = () => import('./supabase.server')

async function me(token: string) {
  const m = await sb()
  const u = await m.getUser(token)
  if (!u) throw new Error('Please sign in again')
  return { m, u }
}

export const myAccount = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const { m, u } = await me(data.token)
    const [profile] = await m.select<any>('profiles', { select: '*', id: `eq.${u.id}` })
    const orders = await m.select<any>('orders', {
      select: '*,order_items(product_name,quantity,unit_price),shipping_details(carrier,tracking_number,tracking_url)',
      user_id: `eq.${u.id}`,
      order: 'created_at.desc',
      limit: '100',
    })
    const addresses = await m.select<any>('addresses', { select: '*', user_id: `eq.${u.id}`, order: 'created_at.desc' })
    return { email: u.email ?? '', profile: profile ?? null, orders, addresses }
  })

export const saveProfile = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, fullName: z.string().trim().max(100), phone: z.union([z.string().trim().regex(/^[6-9]\d{9}$/), z.literal('')]), whatsappConsent: z.boolean() }))
  .handler(async ({ data }) => {
    const { m, u } = await me(data.token)
    await m.update('profiles', { id: `eq.${u.id}` }, { full_name: data.fullName || null, phone: data.phone || null, whatsapp_consent: data.whatsappConsent })
    return { ok: true }
  })

export const saveAddress = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      token: tok,
      fullName: z.string().trim().min(2).max(80),
      phone: z.string().trim().regex(/^[6-9]\d{9}$/),
      line1: z.string().trim().min(5).max(200),
      line2: z.string().trim().max(200).optional(),
      landmark: z.string().trim().max(120).optional(),
      city: z.string().trim().min(2).max(80),
      state: z.string().trim().min(2).max(80),
      pincode: z.string().trim().regex(/^[1-9]\d{5}$/),
    }),
  )
  .handler(async ({ data }) => {
    const { m, u } = await me(data.token)
    await m.insert('addresses', {
      user_id: u.id, full_name: data.fullName, phone: data.phone, line1: data.line1, line2: data.line2 || null,
      landmark: data.landmark || null, city: data.city, state: data.state, pincode: data.pincode,
    })
    return { ok: true }
  })

export const deleteAddress = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { m, u } = await me(data.token)
    await m.remove('addresses', { id: `eq.${data.id}`, user_id: `eq.${u.id}` })
    return { ok: true }
  })

/** Customers can only *request* cancellation; the admin approves (and stock/refund is handled there). */
export const requestCancellation = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, orderId: z.string().uuid(), reason: z.string().trim().max(300).optional() }))
  .handler(async ({ data }) => {
    await rateLimit('cancel', 10, 60_000)
    const { m, u } = await me(data.token)
    const hit = await m.update(
      'orders',
      { id: `eq.${data.orderId}`, user_id: `eq.${u.id}`, order_status: 'in.(pending,confirmed,processing,packed)' },
      { cancel_requested: true, cancel_reason: data.reason || null },
    )
    if (!hit.length) throw new Error('This order can no longer be cancelled online. Please contact us.')
    return { ok: true }
  })
