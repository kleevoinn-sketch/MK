import { Link } from '@tanstack/react-router'
import { Mail, Phone } from 'lucide-react'
import products, { BRAND, img } from '@/data/products'
import { InstagramLogo, WhatsAppLogo } from './BrandIcons'
import { POLICY_LINKS } from '@/data/policies'

export function Footer() {
  return (
    <footer className="mt-16 bg-[#0b1d4d] text-blue-100">
      <a href="#top" className="block bg-[#1347b8] py-3 text-center text-sm font-medium text-white hover:bg-[#1752d0]">Back to top</a>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src={img('/img/kleevo-logo.jpg', 360)} alt="KLEEVO" className="h-14 rounded" />
          <p className="mt-4 text-sm leading-relaxed text-blue-200">
            KLEEVO™ home &amp; vehicle care products — powerful cleaning formulas, manufactured with care by{' '}
            <strong className="text-white">{BRAND.manufacturer}</strong>.
          </p>
          <div className="mt-5 rounded-lg bg-white p-3">
            <img src={img('/img/certifications.jpg', 500)} alt="MSME, FDA Approved and ISI" className="w-full" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {products.map((p) => (
              <li key={p.id}>
                <Link to="/products/$productId" params={{ productId: p.id }} className="hover:text-white hover:underline">{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Help</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/cart" className="hover:text-white hover:underline">Your Cart</Link></li>
            <li><Link to="/" hash="how-to-order" className="hover:text-white hover:underline">How to Order</Link></li>
            <li><Link to="/" hash="how-to-use" className="hover:text-white hover:underline">Usage Instructions</Link></li>
            <li><Link to="/" hash="certifications" className="hover:text-white hover:underline">Certifications</Link></li>
            <li><Link to="/" hash="contact" className="hover:text-white hover:underline">Contact Us</Link></li>
            <li><Link to="/account" className="hover:text-white hover:underline">My Account &amp; Orders</Link></li>
            {POLICY_LINKS.map((l) => (
              <li key={l.slug}><Link to="/policies/$slug" params={{ slug: l.slug }} className="hover:text-white hover:underline">{l.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="block text-xs text-blue-300">Call / WhatsApp</span>
                {BRAND.phones.map((p) => (
                  <a key={p} href={`tel:+91${p}`} className="block font-semibold text-white hover:underline">+91 {p}</a>
                ))}
              </span>
            </li>
            <li className="text-xs leading-relaxed text-blue-200">
              <span className="block font-semibold text-white">{BRAND.manufacturer}</span>
              {BRAND.address}
              <span className="mt-1 block">GSTIN: {BRAND.gstin}</span>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" /> {BRAND.email}
              </a>
            </li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href={BRAND.instagramUrl} target="_blank" rel="noreferrer" aria-label="Follow KLEEVO on Instagram"><InstagramLogo className="h-10 w-10" /></a>
            <a href={`https://wa.me/91${BRAND.whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><WhatsAppLogo className="h-10 w-10" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} KLEEVO™ · Manufactured &amp; marketed by {BRAND.manufacturer} · All prices inclusive of all taxes
      </div>
    </footer>
  )
}
