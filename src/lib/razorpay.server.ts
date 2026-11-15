// Server-only Razorpay core. Secrets come from environment variables and never reach the browser.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { insert, rpc, select, update } from './supabase.server'

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

function auth() {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) throw new Error('Online payment is not configured yet. Please use UPI QR payment.')
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64')
}

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  return x.length === y.length && timingSafeEqual(x, y)
}

export const hmacHex = (secret: string, payload: string) => createHmac('sha256', secret).update(payload).digest('hex')

export async function createRazorpayOrder(orderId: string, orderNumber: string, totalInr: number) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: Math.round(totalInr * 100), currency: 'INR', receipt: orderNumber, notes: { order_number: orderNumber } }),
  })
  const body = (await res.json()) as { id?: string; error?: { description?: string } }
  if (!res.ok || !body.id) throw new Error(body.error?.description ?? 'Could not start online payment')
  await insert('payments', {
    order_id: orderId,
    provider: 'razorpay',
    provider_order_id: body.id,
    amount: totalInr,
    status: 'pending',
  })
  return body.id
}

async function fetchRazorpayPayment(paymentId: string) {
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: auth() },
  })
  if (!res.ok) throw new Error('Could not verify payment with Razorpay')
  return (await res.json()) as { id: string; order_id: string; status: string; amount: number; currency: string; method?: string }
}

/**
 * Idempotently mark an order paid. Safe to call from both the browser verify step and the webhook:
 * only the first caller flips the payment row, and confirm_order deducts stock exactly once.
 */
export async function finalizePayment(providerOrderId: string, providerPaymentId: string, raw?: unknown) {
  const [pay] = await select<{ id: string; order_id: string; amount: string; status: string }>('payments', {
    select: 'id,order_id,amount,status',
    provider_order_id: `eq.${providerOrderId}`,
    limit: '1',
  })
  if (!pay) throw new Error('Unknown payment order')
  if (pay.status === 'paid') return { alreadyProcessed: true, orderId: pay.order_id }

  // Trusted server-to-server check: status AND amount AND order must match what we created.
  const rp = await fetchRazorpayPayment(providerPaymentId)
  if (rp.order_id !== providerOrderId) throw new Error('Payment does not belong to this order')
  if (rp.currency !== 'INR' || rp.amount !== Math.round(Number(pay.amount) * 100)) throw new Error('Payment amount mismatch')
  if (rp.status !== 'captured') throw new Error(`Payment not captured (status: ${rp.status})`)

  // Claim the row; only one concurrent caller gets a row back.
  const claimed = await update<{ id: string }>(
    'payments',
    { id: `eq.${pay.id}`, status: 'neq.paid' },
    { status: 'paid', provider_payment_id: providerPaymentId, raw_event: raw ?? null, updated_at: new Date().toISOString() },
  )
  if (!claimed.length) return { alreadyProcessed: true, orderId: pay.order_id }

  try {
    await rpc('confirm_order', { p_order: pay.order_id, p_payment_status: 'paid' })
  } catch (e) {
    // Money was captured but stock could not be reserved: flag for the admin, do not lose the payment.
    await update('orders', { id: `eq.${pay.order_id}` }, { payment_status: 'paid' })
    await insert('notifications', {
      order_id: pay.order_id,
      channel: 'admin',
      event: 'paid_but_stock_conflict',
      status: 'queued',
      detail: e instanceof Error ? e.message : 'confirm_order failed',
    })
  }
  return { alreadyProcessed: false, orderId: pay.order_id }
}

export async function markPaymentFailed(providerOrderId: string, raw?: unknown) {
  await update('payments', { provider_order_id: `eq.${providerOrderId}`, status: 'eq.pending' }, { status: 'failed', raw_event: raw ?? null })
}
