import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'


import '../styles.css'
import { CartProvider } from '@/lib/cart'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Toast } from '@/components/Toast'

const siteName = 'KLEEVO™ – Home & Car Cleaning Products | S.M Enterprises'
const siteDescription =
  'Shop genuine KLEEVO Dish Wash, Cloth Detergent, Floor Wash, Toilet Cleaner, Bathroom Cleaner, Car Wash and Glass Cleaner online. 500 ml bottles from ₹100. Prepaid UPI ordering with doorstep delivery.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body id="top" className="bg-[#f1f3f6] text-gray-900">
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <Toast />
        </CartProvider>
        <Scripts />
      </body>
    </html>
  )
}
