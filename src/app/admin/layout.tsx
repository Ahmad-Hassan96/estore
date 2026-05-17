import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="w-56 bg-charcoal text-cream flex flex-col fixed h-full">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display text-lg font-bold tracking-widest uppercase">BRAND NAME</p>
          <p className="text-xs text-cream/50 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
            { href: '/admin/products', label: 'Products', icon: Package },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-cream/70 hover:text-cream hover:bg-white/10 rounded transition-colors"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <p className="text-xs text-cream/40 px-3 mb-2">{profile?.full_name || user.email}</p>
          <form action="/api/auth/signout" method="post">
            <button className="flex items-center gap-3 px-3 py-2 text-sm text-cream/60 hover:text-cream w-full transition-colors">
              <LogOut size={14} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-56 flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
