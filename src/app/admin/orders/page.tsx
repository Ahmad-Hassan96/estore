import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import type { Order, OrderStatus } from '@/lib/types'

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

interface OrdersPageProps {
  searchParams: { status?: string }
}

async function getOrders(status?: string): Promise<Order[]> {
  const supabase = await createClient()
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data } = await query.limit(100)
  return data || []
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const orders = await getOrders(searchParams.status)
  const activeStatus = searchParams.status || ''

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <span className="text-sm text-muted">{orders.length} orders</span>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/admin/orders"
          className={`text-xs px-3 py-1.5 border transition-colors ${!activeStatus ? 'bg-charcoal text-cream border-charcoal' : 'border-border text-muted hover:border-charcoal'}`}
        >
          All
        </Link>
        {STATUSES.map(s => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`text-xs px-3 py-1.5 border transition-colors capitalize ${activeStatus === s ? 'bg-charcoal text-cream border-charcoal' : 'border-border text-muted hover:border-charcoal'}`}
          >
            {getOrderStatusLabel(s)}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-border">
              <tr>
                {['Order No.', 'Customer', 'Phone', 'City', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">No orders found</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-charcoal whitespace-nowrap">{order.order_number}</td>
                  <td className="px-4 py-3 text-charcoal">{order.customer_name}</td>
                  <td className="px-4 py-3 text-muted">{order.customer_phone}</td>
                  <td className="px-4 py-3 text-muted">{order.city}</td>
                  <td className="px-4 py-3 text-muted">{(order.items as any[]).length} item(s)</td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 font-medium ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('en-PK')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-rose hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
