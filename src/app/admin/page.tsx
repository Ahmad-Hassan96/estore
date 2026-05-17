import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import type { Order } from '@/lib/types'

async function getStats() {
  const supabase = createClient()

  const [ordersRes, productsRes, pendingRes, revenueRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('total').in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
  ])

  const revenue = (revenueRes.data || []).reduce((sum, o) => sum + o.total, 0)

  return {
    totalOrders: ordersRes.count || 0,
    totalProducts: productsRes.count || 0,
    pendingOrders: pendingRes.count || 0,
    totalRevenue: revenue,
  }
}

async function getRecentOrders(): Promise<Order[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  return data || []
}

async function getLowStockProducts() {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, stock, category')
    .eq('is_active', true)
    .lt('stock', 5)
    .order('stock', { ascending: true })
    .limit(5)
  return data || []
}

export default async function AdminDashboard() {
  const [stats, recentOrders, lowStock] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getLowStockProducts(),
  ])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-charcoal mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.totalOrders, color: 'bg-blue-50 text-blue-700' },
          { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Active Products', value: stats.totalProducts, color: 'bg-green-50 text-green-700' },
          { label: 'Revenue (COD)', value: formatPrice(stats.totalRevenue), color: 'bg-rose-50 text-rose-700' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-border p-5">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold font-display ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-border">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display text-base font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-rose hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-border">
                <tr>
                  {['Order', 'Customer', 'City', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="text-charcoal font-medium hover:text-rose">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal">{order.customer_name}</td>
                    <td className="px-4 py-3 text-muted">{order.city}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-PK')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-border h-fit">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-display text-base font-semibold">Low Stock</h2>
            <Link href="/admin/products" className="text-xs text-rose hover:underline">Manage</Link>
          </div>
          <div className="divide-y divide-border">
            {lowStock.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">All products are well-stocked ✓</p>
            ) : lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-charcoal line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted capitalize">{p.category}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
