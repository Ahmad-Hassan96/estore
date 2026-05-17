import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import type { Order } from '@/lib/types'

async function getOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const orders = await getOrders(user.id)
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Account</h1>
            <p className="text-muted text-sm mt-1">{profile?.full_name || user.email}</p>
          </div>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm text-muted hover:text-charcoal underline underline-offset-2">Sign Out</button>
          </form>
        </div>

        <h2 className="font-display text-xl font-semibold mb-4">Order History</h2>

        {orders.length === 0 ? (
          <div className="text-center py-16 border border-border">
            <p className="text-muted mb-4">You have no orders yet.</p>
            <Link href="/shop" className="text-rose text-sm underline underline-offset-2">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display font-semibold text-charcoal">{order.order_number}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                    <p className="text-sm font-semibold mt-1">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="text-sm text-muted">
                  {(order.items as any[]).map((item: any) => (
                    <span key={item.product_id}>
                      {item.product_name} × {item.quantity}
                      {' '}
                    </span>
                  ))}
                </div>

                {order.tracking_number && (
                  <p className="text-xs text-muted mt-2">
                    Tracking: <span className="font-medium text-charcoal">{order.tracking_number}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
