'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Search, User, LogOut, Package, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=lawn', label: 'Lawn' },
  { href: '/shop?category=cotton', label: 'Cotton' },
  { href: '/shop?category=chiffon', label: 'Chiffon' },
  { href: '/shop?collection=new', label: 'New Arrivals' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { itemCount, openCart } = useCartStore()
  const count = itemCount()

  // Load user on mount and listen for auth changes
  useEffect(() => {
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsAdmin(data?.role === 'admin')
      }
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setIsAdmin(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setAccountOpen(false)
    window.location.href = '/'
  }

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
          <div className="flex items-center gap-1">
            {/* Search */}
            <Link href="/shop" className="p-2 text-muted hover:text-charcoal transition-colors" aria-label="Search">
              <Search size={18} />
            </Link>

            {/* Cart */}
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

            {/* Account icon + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={cn(
                  'flex items-center gap-1 p-2 transition-colors',
                  user ? 'text-charcoal' : 'text-muted hover:text-charcoal'
                )}
                aria-label="Account"
              >
                <User size={18} />
                {user && <ChevronDown size={12} className={cn('transition-transform', accountOpen && 'rotate-180')} />}
              </button>

              {/* Dropdown */}
              {accountOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-border shadow-lg z-50 animate-fade-in">
                  {user ? (
                    <>
                      {/* Logged in state */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs text-muted">Signed in as</p>
                        <p className="text-sm font-medium text-charcoal truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-stone-50 transition-colors"
                        >
                          <Package size={15} className="text-muted" />
                          My Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose font-medium hover:bg-stone-50 transition-colors"
                          >
                            <User size={15} />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-border py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted hover:text-red-500 hover:bg-stone-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Logged out state */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-xs text-muted">Welcome! Sign in to track orders.</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/login"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-stone-50 transition-colors font-medium"
                        >
                          <User size={15} className="text-muted" />
                          Sign In
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal hover:bg-stone-50 transition-colors"
                        >
                          <Package size={15} className="text-muted" />
                          Create Account
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'lg:hidden overflow-hidden transition-all duration-300',
        mobileOpen ? 'max-h-screen border-t border-border' : 'max-h-0'
      )}>
        <nav className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-charcoal py-2.5 border-b border-border/50 last:border-0"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="border-t border-border mt-2 pt-3 space-y-1">
            {user ? (
              <>
                <p className="text-xs text-muted px-1 mb-2">Signed in as {user.email}</p>
                <Link href="/account" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-sm text-charcoal">
                  <Package size={15} className="text-muted" /> My Orders
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-sm text-rose font-medium">
                    <User size={15} /> Admin Panel
                  </Link>
                )}
                <button onClick={handleSignOut}
                  className="flex items-center gap-3 py-2.5 text-sm text-muted w-full">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-sm font-medium text-charcoal">
                  <User size={15} className="text-muted" /> Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 py-2.5 text-sm text-charcoal">
                  <Package size={15} className="text-muted" /> Create Account
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
