'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import type { Order, OrderStatus } from '@/lib/types'

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<OrderStatus>('pending')
  const [tracking, setTracking] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('orders').select('*').eq('id', id).single()
      if (data) {
        setOrder(data)
        setStatus(data.status)
        setTracking(data.tracking_number || '')
        setAdminNotes(data.admin_notes || '')
      }
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      status,
      tracking_number: tracking || null,
      admin_notes: adminNotes || null,
    }).eq('id', id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setOrder(prev => prev ? { ...prev, status, tracking_number: tracking, admin_notes: adminNotes } : prev)
  }

  if (loading) return <div className="text-muted text-sm">Loading...</div>
  if (!order) return <div className="text-muted text-sm">Order not found</div>

  const items = order.items as any[]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-xs text-muted hover:text-charcoal">← Back</button>
        <h1 className="font-display text-2xl font-bold">{order.order_number}</h1>
        <span className={`text-xs px-2 py-1 font-medium ${getOrderStatusColor(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-5">
          {/* Items */}
          <div className="bg-white border border-border p-5">
            <h2 className="font-display text-base font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item: any) => (
                <div key={item.product_id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-stone-100 flex-shrink-0 overflow-hidden">
                    {item.image && <Image src={item.image} alt={item.product_name} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{item.product_name}</p>
                    <p className="text-xs text-muted mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-5 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span><span>{formatPrice(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-charcoal">
                <span>Total (COD)</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-border p-5">
            <h2 className="font-display text-base font-semibold mb-4">Customer</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-xs text-muted uppercase tracking-wide">Name</dt><dd className="font-medium mt-0.5">{order.customer_name}</dd></div>
              <div><dt className="text-xs text-muted uppercase tracking-wide">Phone</dt><dd className="font-medium mt-0.5">{order.customer_phone}</dd></div>
              {order.customer_email && <div className="col-span-2"><dt className="text-xs text-muted uppercase tracking-wide">Email</dt><dd className="font-medium mt-0.5">{order.customer_email}</dd></div>}
              <div className="col-span-2"><dt className="text-xs text-muted uppercase tracking-wide">Address</dt><dd className="font-medium mt-0.5">{order.address}</dd></div>
              <div><dt className="text-xs text-muted uppercase tracking-wide">City</dt><dd className="font-medium mt-0.5">{order.city}</dd></div>
              <div><dt className="text-xs text-muted uppercase tracking-wide">Province</dt><dd className="font-medium mt-0.5">{order.province}</dd></div>
            </dl>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Customer Notes</p>
                <p className="text-sm text-charcoal">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-5">
          <div className="bg-white border border-border p-5">
            <h2 className="font-display text-base font-semibold mb-4">Update Order</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Tracking Number</label>
                <input
                  value={tracking}
                  onChange={e => setTracking(e.target.value)}
                  placeholder="TCS-123456789"
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes..."
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-2.5 text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-charcoal text-cream hover:bg-rose'} disabled:opacity-60`}
              >
                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-stone-50 border border-border p-4 text-xs text-muted space-y-1">
            <p>Placed: {new Date(order.created_at).toLocaleString('en-PK')}</p>
            <p>Updated: {new Date(order.updated_at).toLocaleString('en-PK')}</p>
            <p>Payment: Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  )
}
