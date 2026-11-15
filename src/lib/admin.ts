import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

// Every admin function takes the caller's Supabase access token and re-checks admin rights in the DB
// (public.is_kleevo_admin -> private.admin_users). There are no hardcoded admin credentials.
const tok = z.string().min(20).max(4000)
const sb = () => import('./supabase.server')

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded',
] as const

export const adminCheck = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => ({ isAdmin: await (await sb()).isAdminToken(data.token) }))

export const adminOverview = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    const [orders, products, customers, enquiries] = await Promise.all([
      m.select<any>('orders', { select: 'id,order_number,customer_name,total_amount,payment_status,order_status,created_at', order: 'created_at.desc', limit: '1000' }),
      m.select<any>('products', { select: 'id,name,sku,stock_qty,low_stock_threshold,is_active' }),
      m.select<any>('profiles', { select: 'id' }),
      m.select<any>('enquiries', { select: 'id,status' }),
    ])
    const paid = orders.filter((o: any) => o.payment_status === 'paid')
    const day = (d: string) => d.slice(0, 10)
    const daily: Record<string, number> = {}
    for (const o of paid) daily[day(o.created_at)] = (daily[day(o.created_at)] ?? 0) + Number(o.total_amount)
    return {
      totalSales: paid.reduce((s: number, o: any) => s + Number(o.total_amount), 0),
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      pendingOrders: orders.filter((o: any) => ['pending', 'confirmed', 'processing', 'packed'].includes(o.order_status)).length,
      completedOrders: orders.filter((o: any) => o.order_status === 'delivered').length,
      awaitingPaymentCheck: orders.filter((o: any) => o.payment_status === 'verification').length,
      newEnquiries: enquiries.filter((e: any) => e.status === 'new').length,
      lowStock: products.filter((p: any) => p.is_active && p.stock_qty <= p.low_stock_threshold),
      recentOrders: orders.slice(0, 8),
      daily: Object.entries(daily).sort().slice(-30).map(([date, amount]) => ({ date, amount })),
    }
  })

export const adminListOrders = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, status: z.string().max(30).optional(), q: z.string().max(60).optional() }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    const q: Record<string, string> = {
      select: '*,order_items(product_name,quantity,unit_price),shipping_details(*)',
      order: 'created_at.desc',
      limit: '200',
    }
    if (data.status) q.order_status = `eq.${data.status}`
    if (data.q) {
      const s = data.q.replace(/[(),*]/g, '')
      q.or = `(order_number.ilike.*${s}*,customer_name.ilike.*${s}*,phone.ilike.*${s}*)`
    }
    return m.select<any>('orders', q)
  })

const orderAction = z.discriminatedUnion('action', [
  z.object({ action: z.literal('verify_payment') }), // UPI QR / COD collected
  z.object({ action: z.literal('set_status'), status: z.enum(ORDER_STATUSES) }),
  z.object({ action: z.literal('tracking'), carrier: z.string().max(60), trackingNumber: z.string().max(80), trackingUrl: z.string().url().max(300).optional() }),
  z.object({ action: z.literal('mark_refunded') }),
])

export const adminUpdateOrder = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, orderId: z.string().uuid(), change: orderAction }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    const c = data.change
    const id = { id: `eq.${data.orderId}` }
    if (c.action === 'verify_payment') {
      await m.rpc('confirm_order', { p_order: data.orderId, p_payment_status: 'paid' }) // deducts stock once
    } else if (c.action === 'set_status') {
      if (c.status === 'confirmed') await m.rpc('confirm_order', { p_order: data.orderId, p_payment_status: 'paid' })
      else {
        await m.update('orders', id, { order_status: c.status })
        if (c.status === 'cancelled') await m.rpc('restock_order', { p_order: data.orderId, p_reason: 'cancellation' })
        if (c.status === 'returned') await m.rpc('restock_order', { p_order: data.orderId, p_reason: 'return' })
        if (c.status === 'delivered') {
          await m.update('shipping_details', { order_id: `eq.${data.orderId}` }, { delivered_at: new Date().toISOString() })
        }
      }
    } else if (c.action === 'tracking') {
      const row = { order_id: data.orderId, carrier: c.carrier, tracking_number: c.trackingNumber, tracking_url: c.trackingUrl ?? null, shipped_at: new Date().toISOString() }
      const hit = await m.update('shipping_details', { order_id: `eq.${data.orderId}` }, row)
      if (!hit.length) await m.insert('shipping_details', row)
    } else if (c.action === 'mark_refunded') {
      await m.update('orders', id, { payment_status: 'refunded', order_status: 'refunded' })
      await m.rpc('restock_order', { p_order: data.orderId, p_reason: 'cancellation' })
    }
    return { ok: true }
  })

export const adminListProducts = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    return m.select<any>('products', { select: '*,product_categories(name),product_images(url,sort_order)', order: 'name.asc' })
  })

export const adminSaveProduct = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      token: tok,
      id: z.string().uuid().optional(),
      sku: z.string().trim().min(3).max(30),
      slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/),
      name: z.string().trim().min(2).max(120),
      description: z.string().max(3000).optional(),
      shortDescription: z.string().max(300).optional(),
      sizeMl: z.number().int().min(1).max(100000),
      price: z.number().min(0).max(1000000),
      mrp: z.number().min(0).max(1000000).nullable().optional(),
      discountPrice: z.number().min(0).max(1000000).nullable().optional(),
      isActive: z.boolean(),
      isFeatured: z.boolean(),
      isBestseller: z.boolean(),
      lowStockThreshold: z.number().int().min(0).max(100000),
    }),
  )
  .handler(async ({ data }) => {
    const m = await sb()
    const admin = await m.requireAdmin(data.token)
    void admin
    const row = {
      sku: data.sku, slug: data.slug, name: data.name, description: data.description ?? null,
      short_description: data.shortDescription ?? null, size_ml: data.sizeMl, price_inr: data.price,
      mrp_inr: data.mrp ?? null, discount_price_inr: data.discountPrice ?? null, is_active: data.isActive,
      is_featured: data.isFeatured, is_bestseller: data.isBestseller, low_stock_threshold: data.lowStockThreshold,
    }
    if (data.id) await m.update('products', { id: `eq.${data.id}` }, row)
    else await m.insert('products', row)
    return { ok: true }
  })

/** Stock changes always go through here so every adjustment is logged. */
export const adminAdjustStock = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, productId: z.string().uuid(), newQty: z.number().int().min(0).max(1_000_000), note: z.string().max(200).optional() }))
  .handler(async ({ data }) => {
    const m = await sb()
    const admin = await m.requireAdmin(data.token)
    const [p] = await m.select<{ stock_qty: number }>('products', { select: 'stock_qty', id: `eq.${data.productId}` })
    if (!p) throw new Error('Product not found')
    const delta = data.newQty - p.stock_qty
    if (delta === 0) return { ok: true }
    await m.update('products', { id: `eq.${data.productId}` }, { stock_qty: data.newQty })
    await m.insert('inventory_transactions', {
      product_id: data.productId, change_qty: delta, reason: delta > 0 ? 'restock' : 'manual_adjustment',
      note: data.note ?? null, created_by: admin.id,
    })
    return { ok: true }
  })

export const adminListEnquiries = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    return m.select<any>('enquiries', { select: '*', order: 'created_at.desc', limit: '200' })
  })

export const adminUpdateEnquiry = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, id: z.string().uuid(), status: z.enum(['new', 'contacted', 'closed']), notes: z.string().max(2000).optional() }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    await m.update('enquiries', { id: `eq.${data.id}` }, { status: data.status, admin_notes: data.notes ?? null })
    return { ok: true }
  })

export const adminListCoupons = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    return m.select<any>('coupons', { select: '*', order: 'created_at.desc' })
  })

export const adminSaveCoupon = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      token: tok,
      id: z.string().uuid().optional(),
      code: z.string().trim().min(3).max(30).regex(/^[A-Za-z0-9_-]+$/),
      discountType: z.enum(['percent', 'fixed']),
      discountValue: z.number().positive().max(100000),
      minOrderValue: z.number().min(0).max(1000000),
      maxDiscount: z.number().positive().nullable().optional(),
      expiresAt: z.string().datetime().nullable().optional(),
      usageLimit: z.number().int().positive().nullable().optional(),
      isActive: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    const row = {
      code: data.code.toUpperCase(), discount_type: data.discountType, discount_value: data.discountValue,
      min_order_value: data.minOrderValue, max_discount: data.maxDiscount ?? null, expires_at: data.expiresAt ?? null,
      usage_limit: data.usageLimit ?? null, is_active: data.isActive,
    }
    if (data.id) await m.update('coupons', { id: `eq.${data.id}` }, row)
    else await m.insert('coupons', row)
    return { ok: true }
  })

export const adminListCustomers = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, q: z.string().max(60).optional() }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    const q: Record<string, string> = { select: 'id,full_name,phone,created_at', order: 'created_at.desc', limit: '200' }
    if (data.q) q.or = `(full_name.ilike.*${data.q.replace(/[(),*]/g, '')}*,phone.ilike.*${data.q.replace(/[(),*]/g, '')}*)`
    return m.select<any>('profiles', q)
  })

export const adminSaveSetting = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok, key: z.enum(['delivery_fee', 'free_delivery_above', 'cod_enabled', 'razorpay_enabled', 'upi_qr_enabled', 'gst_rate_percent']), value: z.union([z.number().min(0).max(100000), z.boolean()]) }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    await m.update('site_settings', { key: `eq.${data.key}` }, { value: data.value, updated_at: new Date().toISOString() })
    return { ok: true }
  })

export const adminGetSettings = createServerFn({ method: 'POST' })
  .validator(z.object({ token: tok }))
  .handler(async ({ data }) => {
    const m = await sb()
    await m.requireAdmin(data.token)
    return m.select<{ key: string; value: unknown }>('site_settings', { select: 'key,value' })
  })
