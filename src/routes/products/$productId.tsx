import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { AlertTriangle, BadgeCheck, CheckCircle2, ChevronRight, Minus, Plus, QrCode, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react'
import products, { BRAND, getProduct, img, inr } from '@/data/products'
import { useCart } from '@/lib/cart'
import { ProductCard } from '@/components/ProductCard'
import { WhatsAppLogo } from '@/components/BrandIcons'

export const Route = createFileRoute('/products/$productId')({
  loader: ({ params }) => {
    const product = getProduct(params.productId)
    if (!product) throw notFound()
    return product
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} ${loaderData.size} – ${inr(loaderData.price)} | KLEEVO` },
          { name: 'description', content: loaderData.shortDescription },
          { property: 'og:title', content: `${loaderData.name} ${loaderData.size} | KLEEVO` },
          { property: 'og:description', content: loaderData.shortDescription },
          { property: 'og:image', content: loaderData.image },
        ]
      : [],
    // Only facts we actually have: no ratings/reviews are claimed.
    scripts: loaderData
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: `${loaderData.name} ${loaderData.size}`,
              description: loaderData.shortDescription,
              image: loaderData.image,
              brand: { '@type': 'Brand', name: 'KLEEVO' },
              manufacturer: { '@type': 'Organization', name: 'S.M ENTERPRISES' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: loaderData.price,
                availability: loaderData.stock !== undefined && loaderData.stock <= 0 ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
              },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/" hash="products" className="mt-4 inline-block font-semibold text-[#1347b8]">Browse all KLEEVO products</Link>
    </div>
  ),
  component: ProductPage,
})

function ProductPage() {
  const p = Route.useLoaderData()
  const { add } = useCart()
  const navigate = useNavigate()
  const [qty, setQty] = useState(1)
  const [view, setView] = useState<'bottle' | 'label'>('bottle')
  const [tab, setTab] = useState<'description' | 'usage' | 'caution'>('description')
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <nav className="mb-3 flex items-center gap-1 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#1347b8]">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/" search={{ cat: p.category }} hash="products" className="hover:text-[#1347b8]">{p.category}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-800">{p.name}</span>
      </nav>

      <div className="grid gap-6 rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Gallery */}
        <div className="lg:sticky lg:top-40 lg:self-start">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              {(['bottle', 'label'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`h-16 w-16 overflow-hidden rounded-md border-2 bg-white sm:h-20 sm:w-20 ${view === v ? 'border-[#1347b8]' : 'border-gray-200 hover:border-gray-400'}`}
                  aria-label={v === 'bottle' ? 'View bottle' : 'View original label'}
                >
                  <img src={img(v === 'bottle' ? p.image : p.label, 160)} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-lg border border-gray-100 bg-white">
              {off > 0 && <span className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">{off}% OFF</span>}
              {view === 'bottle' ? (
                <img src={img(p.image, 900)} alt={`${p.name} ${p.size}`} className="aspect-square w-full object-contain" />
              ) : (
                <a href={img(p.label, 1600)} target="_blank" rel="noreferrer" title="Open full label">
                  <img src={img(p.label, 900)} alt={`Original ${p.labelName} label`} className="aspect-square w-full object-contain" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">Original label · tap to zoom</span>
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 hidden grid-cols-2 gap-3 sm:grid">
            <button disabled={p.stock !== undefined && p.stock <= 0} onClick={() => add(p.id, qty)} className="disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 rounded-md bg-[#ff9f00] py-4 text-base font-bold text-white shadow hover:bg-[#f39200]">
              <ShoppingCart className="h-5 w-5" /> ADD TO CART
            </button>
            <button disabled={p.stock !== undefined && p.stock <= 0} onClick={() => { add(p.id, qty); navigate({ to: '/cart' }) }} className="disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 rounded-md bg-[#fb641b] py-4 text-base font-bold text-white shadow hover:bg-[#ec5810]">
              <Zap className="h-5 w-5" /> ORDER NOW
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: p.accent }}>KLEEVO™ · {p.category} Care</span>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{p.name} – {p.labelName}, {p.size}</h1>
          <p className="mt-1 text-sm italic text-gray-500">“{p.tagline}”</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white"><BadgeCheck className="h-3.5 w-3.5" /> KLEEVO Assured</span>
            <span className="text-gray-500">Manufactured by {BRAND.manufacturer}</span>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            {off > 0 && <p className="text-sm font-semibold text-emerald-600">Special price</p>}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">{inr(p.price)}</span>
              {off > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{inr(p.mrp)}</span>
                  <span className="text-lg font-semibold text-emerald-600">{off}% off</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">M.R.P. {inr(p.mrp)} (Incl. of all taxes) · USP ₹{p.uspPerMl} per ml</p>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600">Quantity</span>
            <div className="flex items-center rounded-md border border-gray-300">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2.5 hover:bg-gray-100" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(50, q + 1))} className="p-2.5 hover:bg-gray-100" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-sm text-gray-500">Net volume: <strong className="text-gray-800">{p.size}</strong></span>
          </div>

          <div className="mt-5 grid gap-2 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-3">
            <span className="flex items-center gap-2"><Truck className="h-5 w-5 text-[#1347b8]" /> Free doorstep delivery</span>
            <span className="flex items-center gap-2"><QrCode className="h-5 w-5 text-[#1347b8]" /> Prepaid via UPI QR</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#1347b8]" /> 100% genuine</span>
          </div>

          <div className="mt-5">
            <h2 className="mb-2 text-base font-bold">Highlights</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {f}</li>
              ))}
            </ul>
          </div>

          {/* Tabs */}
          <div className="mt-6 rounded-lg border border-gray-200">
            <div className="flex border-b border-gray-200 text-sm font-semibold">
              {([
                ['description', 'Description'],
                ['usage', 'How to Use'],
                ['caution', 'Caution & Warning'],
              ] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`flex-1 px-3 py-3 ${tab === k ? 'border-b-2 border-[#1347b8] text-[#1347b8]' : 'text-gray-500 hover:text-gray-800'}`}>{l}</button>
              ))}
            </div>
            <div className="p-4 text-[15px] leading-relaxed text-gray-700">
              {tab === 'description' && (
                <>
                  <p>{p.description}</p>
                  {p.areas && <p className="mt-3"><strong className="text-red-600">Area to be cleaned:</strong> {p.areas}</p>}
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-gray-50 p-3 text-sm">
                    <dt className="text-gray-500">Brand</dt><dd className="font-medium">KLEEVO™</dd>
                    <dt className="text-gray-500">Net Volume</dt><dd className="font-medium">{p.size}</dd>
                    <dt className="text-gray-500">M.R.P.</dt><dd className="font-medium">{inr(p.mrp)} (Incl. of all taxes)</dd>
                    <dt className="text-gray-500">Unit Sale Price</dt><dd className="font-medium">₹{p.uspPerMl} per ml</dd>
                    <dt className="text-gray-500">Best Before</dt><dd className="font-medium">{p.bestBefore}</dd>
                    <dt className="text-gray-500">Manufactured By</dt><dd className="font-medium">{BRAND.manufacturer}</dd>
                    <dt className="text-gray-500">Country of Origin</dt><dd className="font-medium">India</dd>
                  </dl>
                </>
              )}
              {tab === 'usage' && (
                <ol className="space-y-3">
                  {p.howToUse.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1347b8] text-sm font-bold text-white">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              )}
              {tab === 'caution' && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="mb-2 flex items-center gap-2 font-bold text-red-700"><AlertTriangle className="h-5 w-5" /> CAUTION</p>
                  <ul className="list-disc space-y-1.5 pl-5 text-red-900">
                    {p.caution.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <a href={`https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent(`Hi KLEEVO, I have a question about ${p.name} (${p.size}).`)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline">
            <WhatsAppLogo className="h-5 w-5" /> Have a question? Chat with us on WhatsApp
          </a>
        </div>
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-xl font-bold">You may also like</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {products.filter((x) => x.id !== p.id).slice(0, 4).map((x) => <ProductCard key={x.id} product={x} />)}
        </div>
      </section>

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 shadow-[0_-4px_12px_rgba(0,0,0,.12)] sm:hidden">
        <button disabled={p.stock !== undefined && p.stock <= 0} onClick={() => add(p.id, qty)} className="bg-white py-4 text-sm font-bold text-gray-900">ADD TO CART</button>
        <button disabled={p.stock !== undefined && p.stock <= 0} onClick={() => { add(p.id, qty); navigate({ to: '/cart' }) }} className="bg-[#fb641b] py-4 text-sm font-bold text-white">ORDER NOW · {inr(p.price * qty)}</button>
      </div>
    </div>
  )
}
