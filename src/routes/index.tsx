import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useMemo, useState } from 'react'
import { AlertTriangle, BadgeCheck, ChevronDown, CreditCard, Factory, Mail, PackageCheck, Phone, QrCode, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import products, { BRAND, img, inr } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'
import { InstagramLogo, WhatsAppLogo } from '@/components/BrandIcons'

export const Route = createFileRoute('/')({
  validateSearch: z.object({
    q: z.string().optional(),
    cat: z.string().optional(),
  }),
  component: Home,
})

function Home() {
  const { q, cat } = Route.useSearch()
  const list = useMemo(() => {
    const term = q?.toLowerCase().trim()
    return products.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!term || `${p.name} ${p.labelName} ${p.category} ${p.shortDescription}`.toLowerCase().includes(term)),
    )
  }, [q, cat])

  return (
    <>
      <Hero />
      <TrustBar />

      <section id="products" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
        <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {q ? `Results for “${q}”` : cat ? `${cat} Care` : 'Shop All KLEEVO Products'}
              </h2>
              <p className="text-sm text-gray-500">500 ml bottles · Genuine products direct from the manufacturer</p>
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              <Link to="/" hash="products" className={`rounded-full border px-4 py-1.5 text-sm font-medium ${!cat && !q ? 'border-[#1347b8] bg-blue-50 text-[#1347b8]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>All</Link>
              {['Kitchen', 'Laundry', 'Home', 'Bathroom', 'Vehicle'].map((c) => (
                <Link key={c} to="/" search={{ cat: c }} hash="products" className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium ${cat === c ? 'border-[#1347b8] bg-blue-50 text-[#1347b8]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
          {list.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-16 text-center text-gray-500">
              No products match your search. <Link to="/" hash="products" className="font-semibold text-[#1347b8]">View all products</Link>
            </div>
          )}
        </div>
      </section>

      <HowToOrder />
      <About />
      <Certifications />
      <Usage />
      <Contact />
    </>
  )
}

function Hero() {
  const showcase = ['floor-wash', 'dish-wash', 'car-wash', 'toilet-cleaner', 'glass-cleaner']
  return (
    <section className="bubble-bg relative overflow-hidden text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 md:grid-cols-[1.05fr_1fr] md:py-14">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/30">
            <BadgeCheck className="h-4 w-4 text-amber-300" /> MSME Registered · FDA Approved · ISI
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Powerful Cleaning <span className="text-amber-300">Formula</span> for Every Corner of Your Home
          </h1>
          <p className="mt-4 max-w-xl text-lg text-blue-100">
            7 genuine KLEEVO™ cleaners — kitchen, laundry, floor, bathroom, glass and car care. 500 ml bottles starting at just{' '}
            <strong className="text-white">{inr(100)}</strong>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/" hash="products" className="inline-flex items-center gap-2 rounded-md bg-[#fb641b] px-6 py-3.5 text-base font-bold shadow-lg hover:bg-[#ec5810]">
              <ShoppingCart className="h-5 w-5" /> Shop Now
            </Link>
            <a href={`https://wa.me/91${BRAND.whatsapp}?text=${encodeURIComponent('Hi KLEEVO, I would like to place an order.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3.5 text-base font-bold text-gray-900 shadow-lg hover:bg-gray-100">
              <WhatsAppLogo className="h-5 w-5" /> Order on WhatsApp
            </a>
          </div>
          <p className="mt-5 text-sm text-blue-200">Manufactured by <strong className="text-white">{BRAND.manufacturer}</strong></p>
        </div>
        <div className="relative flex h-72 items-end justify-center overflow-hidden rounded-3xl bg-white shadow-2xl ring-4 ring-white/30 sm:h-96">
          <span className="absolute left-4 top-4 z-30 rounded-full bg-[#fb641b] px-3 py-1 text-xs font-bold">500 ml · from ₹100</span>
          {showcase.map((id, i) => {
            const p = products.find((x) => x.id === id)!
            const pos = [
              'left-[0%] h-[62%] -rotate-6',
              'left-[17%] h-[78%] -rotate-3 z-10',
              'left-1/2 -translate-x-1/2 h-[96%] z-20',
              'right-[17%] h-[78%] rotate-3 z-10',
              'right-[0%] h-[62%] rotate-6',
            ][i]
            return (
              <Link key={id} to="/products/$productId" params={{ productId: id }} className={`absolute bottom-2 aspect-square ${pos} transition hover:-translate-y-2`}>
                <img src={img(p.image, 520)} alt={p.name} className="h-full w-full object-contain" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function TrustBar() {
  const items = [
    { icon: ShieldCheck, t: '100% Genuine', s: 'Direct from manufacturer' },
    { icon: QrCode, t: 'Easy UPI Payment', s: 'Scan QR & pay instantly' },
    { icon: Truck, t: 'Doorstep Delivery', s: 'Free delivery on all orders' },
    { icon: Phone, t: 'Call / WhatsApp', s: `+91 ${BRAND.phones[0]}` },
  ]
  return (
    <div className="mx-auto -mt-0 max-w-7xl px-3 sm:px-4">
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-white p-4 shadow-sm md:grid-cols-4">
        {items.map(({ icon: Icon, t, s }) => (
          <div key={t} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1347b8]"><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-bold text-gray-900">{t}</span>
              <span className="block text-xs text-gray-500">{s}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HowToOrder() {
  const steps = [
    { icon: ShoppingCart, t: 'Add to Cart', s: 'Tap “Add to Cart” or “Order Now” on any product.' },
    { icon: QrCode, t: 'Pay via UPI QR', s: 'Scan the QR with GPay, PhonePe, Paytm or any UPI app.' },
    { icon: PackageCheck, t: 'Confirm Order', s: 'Enter your UPI transaction ID and review your order.' },
    { icon: Truck, t: 'Delivery Details', s: 'Share your address — we deliver to your doorstep.' },
  ]
  return (
    <section id="how-to-order" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">How to Order</h2>
        <p className="text-sm text-gray-500">Ordering takes less than 2 minutes</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, t, s }, i) => (
            <div key={t} className="relative rounded-lg border border-gray-200 p-5">
              <span className="absolute right-4 top-3 font-display text-4xl font-extrabold text-gray-100">0{i + 1}</span>
              <Icon className="h-8 w-8 text-[#fb641b]" />
              <h3 className="mt-3 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-gray-500">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
      <div className="grid items-center gap-6 overflow-hidden rounded-xl bg-white shadow-sm md:grid-cols-2">
        <div className="p-6 sm:p-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1347b8]">About Us</span>
          <h2 className="mt-2 text-3xl font-bold">KLEEVO™ by {BRAND.manufacturer}</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            KLEEVO is a home and vehicle care brand manufactured by <strong>{BRAND.manufacturer}</strong>. Every product is made with a
            powerful cleaning formula that removes tough oil, grease and stains — while staying safe on hands and on your surfaces.
          </p>
          <p className="mt-3 leading-relaxed text-gray-600">
            From sparkling utensils to a streak-free windshield, our range of 7 products covers every corner of your home and your car.
            We are a registered MSME and our products carry FDA approval and ISI marks.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {[['7', 'Products'], ['500 ml', 'Value packs'], ['100%', 'Genuine']].map(([a, b]) => (
              <div key={b} className="rounded-lg bg-blue-50 py-3">
                <div className="font-display text-xl font-extrabold text-[#1347b8]">{a}</div>
                <div className="text-xs text-gray-600">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid h-full grid-cols-3 gap-2 bg-gradient-to-br from-blue-50 to-sky-100 p-4">
          {products.slice(0, 6).map((p) => (
            <img key={p.id} src={img(p.image, 260)} alt={p.name} loading="lazy" className="aspect-square w-full rounded-lg bg-white object-contain" />
          ))}
        </div>
      </div>
    </section>
  )
}

function Certifications() {
  return (
    <section id="certifications" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
      <div className="rounded-xl bg-white p-6 text-center shadow-sm sm:p-10">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
          <BadgeCheck className="h-4 w-4" /> Authentic &amp; Certified
        </span>
        <h2 className="mt-2 text-3xl font-bold">Certified Quality You Can Trust</h2>
        <p className="mx-auto mt-2 max-w-2xl text-gray-500">
          Registered with the Ministry of MSME, Govt. of India · FDA Approved · ISI marked
        </p>
        <img src={img('/img/certifications.jpg', 900)} alt="Ministry of MSME Govt. of India, FDA Approved and ISI certification marks" loading="lazy" className="mx-auto mt-6 w-full max-w-3xl" />
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"><Factory className="h-4 w-4" /> Manufactured by {BRAND.manufacturer}</span>
          <span className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2"><ShieldCheck className="h-4 w-4" /> Made in India</span>
        </div>
      </div>
    </section>
  )
}

function Usage() {
  const [open, setOpen] = useState<string | null>(products[0].id)
  return (
    <section id="how-to-use" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
      <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold">How to Use &amp; Caution</h2>
        <p className="text-sm text-gray-500">Usage instructions and safety notes as printed on every KLEEVO label</p>
        <div className="mt-5 divide-y divide-gray-200 rounded-lg border border-gray-200">
          {products.map((p) => {
            const isOpen = open === p.id
            return (
              <div key={p.id}>
                <button onClick={() => setOpen(isOpen ? null : p.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-gray-50">
                  <img src={img(p.image, 96)} alt="" className="h-12 w-12 rounded object-contain" />
                  <span className="flex-1">
                    <span className="block font-semibold">{p.name}</span>
                    <span className="block text-xs text-gray-500">{p.labelName} · {p.size}</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="grid gap-6 px-4 pb-5 pt-1 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 font-bold text-[#1347b8]">How to Use</h3>
                      <ol className="space-y-2">
                        {p.howToUse.map((s, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-700">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1347b8] text-xs font-bold text-white">{i + 1}</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                      {p.areas && <p className="mt-3 text-sm"><strong className="text-red-600">Area to be cleaned:</strong> {p.areas}</p>}
                    </div>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <h3 className="mb-2 flex items-center gap-2 font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> Caution</h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
                        {p.caution.map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="mx-auto mt-6 max-w-7xl px-3 sm:px-4">
      <div className="bubble-bg grid gap-8 rounded-xl p-6 text-white shadow-sm sm:p-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold">Contact Us</h2>
          <p className="mt-2 text-blue-100">Questions, bulk orders or dealership enquiries — we're happy to help.</p>
          <div className="mt-6 flex gap-3">
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" aria-label="Follow KLEEVO on Instagram" className="transition hover:scale-110"><InstagramLogo className="h-12 w-12" /></a>
            <a href={`https://wa.me/91${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="transition hover:scale-110"><WhatsAppLogo className="h-12 w-12" /></a>
            <a href={`mailto:${BRAND.email}`} aria-label="Email us" className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1347b8] transition hover:scale-110"><Mail className="h-6 w-6" /></a>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/20">
            <div className="flex items-center gap-2 text-sm text-blue-100"><Phone className="h-4 w-4" /> Call / WhatsApp</div>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {BRAND.phones.map((p) => (
                <a key={p} href={`tel:+91${p}`} className="rounded-md bg-white px-3 py-2 text-center font-bold text-gray-900 hover:bg-amber-300">{p}</a>
              ))}
            </div>
          </div>
          <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 rounded-lg bg-white/10 p-4 ring-1 ring-white/20 hover:bg-white/20">
            <Mail className="h-5 w-5" /> <span className="font-semibold">{BRAND.email}</span>
          </a>
          <div className="flex items-center gap-3 rounded-lg bg-white/10 p-4 ring-1 ring-white/20">
            <CreditCard className="h-5 w-5" /> <span>Prepaid orders via UPI QR code</span>
          </div>
        </div>
      </div>
    </section>
  )
}
