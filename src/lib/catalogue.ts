import { createServerFn } from '@tanstack/react-start'

export type LiveRow = { slug: string; price: number; mrp: number; stock: number; active: boolean }

/** Live price / MRP / stock from the database (the single source of truth for what is charged). */
export const getLiveCatalogue = createServerFn({ method: 'GET' }).handler(async (): Promise<Array<LiveRow>> => {
  try {
    const { select } = await import('./supabase.server')
    const rows = await select<any>('products', { select: 'slug,price_inr,discount_price_inr,mrp_inr,stock_qty,is_active' })
    return rows
      .filter((r) => r.slug)
      .map((r) => {
        const price = Number(r.discount_price_inr ?? r.price_inr)
        return { slug: r.slug, price, mrp: Math.max(price, Number(r.mrp_inr ?? r.price_inr)), stock: r.stock_qty, active: r.is_active }
      })
  } catch {
    return [] // DB not configured/reachable: the page still renders from the bundled catalogue
  }
})
