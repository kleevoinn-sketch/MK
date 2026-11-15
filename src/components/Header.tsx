import { Link, useNavigate } from '@tanstack/react-router'
import { ChevronDown, Mail, Menu, Phone, Search, ShoppingCart, X, ShieldCheck, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import products, { BRAND, img } from '@/data/products'
import { useCart } from '@/lib/cart'
import { InstagramLogo, WhatsAppLogo } from './BrandIcons'

const categories = ['Kitchen', 'Laundry', 'Home', 'Bathroom', 'Vehicle']

export function Header() {
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ to: '/', search: { q: q.trim() || undefined }, hash: 'products' })
  }

  return (
    <>
      <div className="bg-[#0b1d4d] text-[12px] text-blue-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Genuine KLEEVO products · Manufactured by {BRAND.manufacturer}
          </span>
          <a href={`tel:+91${BRAND.phones[0]}`} className="hidden items-center gap-1.5 hover:text-white sm:flex">
            <Phone className="h-3.5 w-3.5" /> Call / WhatsApp: +91 {BRAND.phones[0]}
          </a>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-[#05070d] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:gap-5 sm:px-4">
          <button
            onClick={() => setOpen(true)}
            className="rounded-md p-2 hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="shrink-0" aria-label="KLEEVO home">
            <img src={img('/img/kleevo-logo.jpg', 360)} alt="KLEEVO" className="h-9 w-auto sm:h-12" />
          </Link>
          <form onSubmit={submit} className="hidden flex-1 md:flex">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for dish wash, floor cleaner, car shampoo…"
              className="h-11 w-full rounded-l-md border-0 px-4 text-[15px] text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button className="flex h-11 w-14 items-center justify-center rounded-r-md bg-amber-400 text-gray-900 hover:bg-amber-500" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <a href={`https://wa.me/91${BRAND.whatsapp}`} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/10 lg:flex">
              <WhatsAppLogo className="h-7 w-7" />
              <span className="text-left leading-tight">
                <span className="block text-[11px] text-gray-300">Order on WhatsApp</span>
                <span className="block text-sm font-semibold">+91 {BRAND.whatsapp}</span>
              </span>
            </a>
            <Link to="/cart" className="relative flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white/10">
              <span className="relative">
                <ShoppingCart className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-gray-900">
                  {count}
                </span>
              </span>
              <span className="hidden text-sm font-semibold sm:block">Cart</span>
            </Link>
          </div>
        </div>
        <form onSubmit={submit} className="flex px-3 pb-2 md:hidden">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search KLEEVO products"
            className="h-10 w-full rounded-l-md border-0 px-3 text-sm text-gray-900 outline-none"
          />
          <button className="flex h-10 w-12 items-center justify-center rounded-r-md bg-amber-400 text-gray-900" aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
        </form>
        <nav className="bg-[#1347b8]">
          <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 text-sm font-medium sm:px-4">
            <Link to="/" hash="products" className="whitespace-nowrap px-3 py-2 hover:bg-white/10">All Products</Link>
            {categories.map((c) => (
              <Link key={c} to="/" search={{ cat: c }} hash="products" className="whitespace-nowrap px-3 py-2 hover:bg-white/10">
                {c}
              </Link>
            ))}
            <Link to="/" hash="how-to-use" className="whitespace-nowrap px-3 py-2 hover:bg-white/10">How to Use</Link>
            <Link to="/" hash="certifications" className="whitespace-nowrap px-3 py-2 hover:bg-white/10">Certifications</Link>
            <Link to="/" hash="contact" className="whitespace-nowrap px-3 py-2 hover:bg-white/10">Contact Us</Link>
            <span className="ml-auto hidden items-center gap-1.5 whitespace-nowrap py-2 text-amber-300 lg:flex">
              <Truck className="h-4 w-4" /> Prepaid orders via UPI QR · Doorstep delivery
            </span>
          </div>
        </nav>
      </header>
      <MenuDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [productsOpen, setProductsOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const item = 'block border-b border-gray-200 py-4 text-[19px] font-semibold text-gray-800 hover:text-[#1347b8]'

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} />
      <aside
        className={`absolute left-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-y-auto bg-white px-7 pb-8 pt-4 shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between">
          <img src={img('/img/kleevo-logo.jpg', 300)} alt="KLEEVO" className="h-10 rounded" />
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded bg-[#1347b8] text-white ring-2 ring-blue-200" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-4">
          <Link to="/" onClick={onClose} className={item} activeOptions={{ exact: true, includeHash: false }} activeProps={{ className: 'text-[#1347b8]' }}>Home</Link>
          <Link to="/" hash="about" onClick={onClose} className={item}>About Us</Link>
          <div className="border-b border-gray-200">
            <button onClick={() => setProductsOpen((v) => !v)} className="flex w-full items-center justify-between py-4 text-[19px] font-semibold text-gray-800">
              Products
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
            </button>
            {productsOpen && (
              <div className="space-y-1 pb-3">
                {products.map((p) => (
                  <Link key={p.id} to="/products/$productId" params={{ productId: p.id }} onClick={onClose} className="flex items-center gap-3 rounded-md px-2 py-1.5 text-[15px] text-gray-700 hover:bg-blue-50">
                    <img src={img(p.image, 80)} alt="" className="h-9 w-9 rounded object-contain" />
                    {p.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/" hash="certifications" onClick={onClose} className={item}>Certifications</Link>
          <Link to="/" hash="how-to-use" onClick={onClose} className={item}>How to Use</Link>
          <Link to="/cart" onClick={onClose} className={item}>My Cart</Link>
          <Link to="/" hash="contact" onClick={onClose} className={item}>Contact Us</Link>
        </nav>
        <div className="mt-8 space-y-3 text-[15px] text-gray-500">
          {BRAND.phones.map((p) => (
            <a key={p} href={`tel:+91${p}`} className="flex items-center gap-3 underline decoration-gray-300 underline-offset-4 hover:text-gray-800">
              <Phone className="h-5 w-5" /> +91 {p.slice(0, 5)} {p.slice(5)}
            </a>
          ))}
          <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 underline decoration-gray-300 underline-offset-4 hover:text-gray-800">
            <Mail className="h-5 w-5" /> {BRAND.email}
          </a>
        </div>
        <div className="mt-5 flex gap-3">
          <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" aria-label="KLEEVO on Instagram"><InstagramLogo className="h-11 w-11" /></a>
          <a href={`https://wa.me/91${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp KLEEVO"><WhatsAppLogo className="h-11 w-11" /></a>
          <a href={`mailto:${BRAND.email}`} aria-label="Email KLEEVO" className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#1347b8] text-white"><Mail className="h-6 w-6" /></a>
        </div>
        <img src={img('/img/certifications.jpg', 640)} alt="MSME, FDA Approved and ISI certifications" className="mt-6 w-full" />
      </aside>
    </div>
  )
}
