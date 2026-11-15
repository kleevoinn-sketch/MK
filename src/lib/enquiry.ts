import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { rateLimit } from './orders'

export const submitEnquiry = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(100),
      phone: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, 'Enter a valid phone number'),
      email: z.union([z.string().trim().email().max(120), z.literal('')]).optional(),
      message: z.string().trim().min(5).max(2000),
      website: z.string().max(0).optional(), // honeypot: bots fill this, people never see it
    }),
  )
  .handler(async ({ data }) => {
    await rateLimit('enquiry', 4, 60_000)
    if (data.website) return { ok: true } // silently drop bot submissions
    const { insert } = await import('./supabase.server')
    await insert('enquiries', { name: data.name, phone: data.phone, email: data.email || null, message: data.message })
    return { ok: true }
  })
