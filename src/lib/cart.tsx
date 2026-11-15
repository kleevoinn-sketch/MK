import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import products, { DELIVERY_FEE, type Product } from '@/data/products'

export type CartLine = { productId: string; quantity: number }

type CartCtx = {
  ready: boolean
  lines: Array<CartLine & { product: Product }>
  count: number
  subtotal: number
  mrpTotal: number
  delivery: number
  total: number
  add: (productId: string, qty?: number) => void
  setQty: (productId: string, qty: number) => void
  remove: (productId: string) => void
  clear: () => void
  paymentReference: string
  setPaymentReference: (ref: string) => void
  orderReviewed: boolean
  setOrderReviewed: (v: boolean) => void
  toast: string | null
}

const Ctx = createContext<CartCtx | null>(null)
const KEY = 'kleevo-cart-v1'
const PAY_KEY = 'kleevo-checkout-v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Array<CartLine>>([])
  const [ready, setReady] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')
  const [orderReviewed, setOrderReviewed] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]')
      if (Array.isArray(saved)) setRaw(saved.filter((l) => products.some((p) => p.id === l.productId)))
      const pay = JSON.parse(sessionStorage.getItem(PAY_KEY) || '{}')
      if (typeof pay.ref === 'string') setPaymentReference(pay.ref)
      if (pay.reviewed === true) setOrderReviewed(true)
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(raw))
  }, [raw, ready])

  useEffect(() => {
    if (ready) sessionStorage.setItem(PAY_KEY, JSON.stringify({ ref: paymentReference, reviewed: orderReviewed }))
  }, [paymentReference, orderReviewed, ready])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const value = useMemo<CartCtx>(() => {
    const lines = raw
      .map((l) => ({ ...l, product: products.find((p) => p.id === l.productId)! }))
      .filter((l) => l.product)
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0)
    const mrpTotal = lines.reduce((s, l) => s + l.product.mrp * l.quantity, 0)
    const count = lines.reduce((s, l) => s + l.quantity, 0)
    const delivery = lines.length ? DELIVERY_FEE : 0
    return {
      ready,
      lines,
      count,
      subtotal,
      mrpTotal,
      delivery,
      total: subtotal + delivery,
      add: (productId, qty = 1) => {
        const live = products.find((x) => x.id === productId)
        if (live && live.stock !== undefined && live.stock <= 0) {
          setToast(`${live.name} is out of stock`)
          return
        }
        setRaw((prev) => {
          const found = prev.find((l) => l.productId === productId)
          if (found) return prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(50, l.quantity + qty) } : l))
          return [...prev, { productId, quantity: qty }]
        })
        const p = products.find((x) => x.id === productId)
        setToast(`${p?.name ?? 'Item'} added to cart`)
      },
      setQty: (productId, qty) =>
        setRaw((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.max(1, Math.min(50, qty)) } : l))),
      remove: (productId) => setRaw((prev) => prev.filter((l) => l.productId !== productId)),
      clear: () => {
        setRaw([])
        setPaymentReference('')
        setOrderReviewed(false)
      },
      paymentReference,
      setPaymentReference,
      orderReviewed,
      setOrderReviewed,
      toast,
    }
  }, [raw, ready, paymentReference, orderReviewed, toast])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used inside CartProvider')
  return c
}
