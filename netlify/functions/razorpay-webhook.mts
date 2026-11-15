import { finalizePayment, hmacHex, markPaymentFailed, safeEqualHex } from '../../src/lib/razorpay.server'

// Razorpay -> POST /api/razorpay-webhook. The signature is verified against the RAW body.
export default async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return new Response('Webhook not configured', { status: 503 })

  const raw = await req.text()
  const sig = req.headers.get('x-razorpay-signature') ?? ''
  if (!sig || !safeEqualHex(hmacHex(secret, raw), sig)) return new Response('Invalid signature', { status: 400 })

  let event: any
  try {
    event = JSON.parse(raw)
  } catch {
    return new Response('Bad payload', { status: 400 })
  }

  try {
    const p = event?.payload?.payment?.entity
    if (event.event === 'payment.captured' && p?.order_id && p?.id) await finalizePayment(p.order_id, p.id, event)
    else if (event.event === 'payment.failed' && p?.order_id) await markPaymentFailed(p.order_id, event)
    // refund.* events are reconciled by the admin from the Razorpay dashboard.
  } catch (e) {
    console.error('razorpay webhook error', e instanceof Error ? e.message : e)
    return new Response('Processing error', { status: 500 }) // Razorpay will retry
  }
  return new Response('ok', { status: 200 })
}

export const config = { path: '/api/razorpay-webhook' }
