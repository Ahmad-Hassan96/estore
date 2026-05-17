import Link from 'next/link'
import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="font-display text-2xl font-bold text-cream tracking-widest uppercase mb-3">
              BRAND NAME
            </h3>
            <p className="text-sm leading-relaxed text-cream/60 max-w-xs">
              Premium women&apos;s unstitched fabric — crafted for the modern Pakistani woman. Quality you can feel, elegance you can wear.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="text-cream/60 hover:text-rose transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-cream/60 hover:text-rose transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?category=lawn', label: 'Lawn' },
                { href: '/shop?category=cotton', label: 'Cotton' },
                { href: '/shop?category=chiffon', label: 'Chiffon' },
                { href: '/shop?collection=new', label: 'New Arrivals' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/60 hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold text-cream uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/account', label: 'My Orders' },
                { href: '#', label: 'Shipping Info' },
                { href: '#', label: 'Return Policy' },
                { href: '#', label: 'Size Guide' },
                { href: '#', label: 'Contact Us' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-cream/60 hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} BRAND NAME. All rights reserved.</p>
          <p>Cash on Delivery · Nationwide Shipping · PKR Only</p>
        </div>
      </div>
    </footer>
  )
}
