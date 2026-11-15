import { createFileRoute } from '@tanstack/react-router'
import products from '@/data/products'
import { policies } from '@/data/policies'

// Built from the request's own origin, so it is correct on any domain (preview or production).
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => {
        const origin = new URL(request.url).origin
        const paths = ['/', ...products.map((p) => `/products/${p.id}`), ...policies.map((p) => `/policies/${p.slug}`)]
        const xml =
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n') +
          '\n</urlset>\n'
        return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
      },
    },
  },
})
