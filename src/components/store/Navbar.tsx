'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=lawn', label: 'Lawn' },
  { href: '/shop?category=cotton', label: 'Cotton' },
  { href: '/shop?category=chiffon', label: 'Chiffon' },
  { href: '/shop?collection=new', label: 'New Arrivals' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-widest uppercase text-charcoal hover:text-rose transition-colors"
          >
            BRAND NAME
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-muted hover:text-charcoal transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/shop" className="p-2 text-muted hover:text-charcoal transition-colors" aria-label="Search">
              <Search size={18} />
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 text-muted hover:text-charcoal transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-body font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
            <Link
              href="/account"
              className="hidden sm:block text-sm text-muted hover:text-charcoal transition-colors"
            >
              Account
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'lg:hidden overflow-hidden transition-all duration-300',
        mobileOpen ? 'max-h-96 border-t border-border' : 'max-h-0'
      )}>
        <nav className="px-4 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-charcoal py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/account" className="text-sm tracking-wide text-charcoal py-1" onClick={() => setMobileOpen(false)}>
            My Account
          </Link>
        </nav>
      </div>
    </header>
  )
}
