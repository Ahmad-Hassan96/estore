'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Printer } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'
import type { Order, OrderStatus } from '@/lib/types'

// ─── EDIT YOUR BRAND INFO HERE ───────────────────────────────
const BRAND = {
  name: 'BRAND NAME',
  phone: '03XX-XXXXXXX',
  email: 'contact@brandname.com',
  address: 'Your Shop Address, City, Pakistan',
  tagline: 'Premium Women\'s Unstitched Collection',
}
// ─────────────────────────────────────────────────────────────

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const printRef = useRef<HTMLDivElement>(null)
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

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return

    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order?.order_number}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1C1917; background: white; padding: 0; }

          .invoice { max-width: 720px; margin: 0 auto; padding: 32px; }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #1C1917; margin-bottom: 24px; }
          .brand-name { font-size: 22px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
          .brand-tagline { font-size: 10px; color: #78716C; margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; }
          .brand-contact { font-size: 10px; color: #78716C; margin-top: 2px; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #C4856A; }
          .invoice-title p { font-size: 11px; color: #78716C; margin-top: 3px; }

          /* Addresses */
          .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
          .address-box h4 { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #78716C; margin-bottom: 6px; border-bottom: 1px solid #E7E0D8; padding-bottom: 4px; }
          .address-box p { font-size: 12px; line-height: 1.8; }
          .address-box .name { font-weight: 700; font-size: 13px; }

          /* Order meta */
          .order-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid #E7E0D8; margin-bottom: 24px; }
          .meta-item { padding: 10px 14px; border-right: 1px solid #E7E0D8; }
          .meta-item:last-child { border-right: none; }
          .meta-item label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #78716C; display: block; margin-bottom: 3px; }
          .meta-item span { font-size: 12px; font-weight: 600; }

          /* Items table */
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          thead { background: #1C1917; color: white; }
          thead th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          thead th:last-child { text-align: right; }
          tbody tr { border-bottom: 1px solid #E7E0D8; }
          tbody tr:last-child { border-bottom: none; }
          tbody td { padding: 10px 12px; font-size: 12px; }
          tbody td:last-child { text-align: right; font-weight: 600; }
          tbody td.qty { color: #78716C; }

          /* Totals */
          .totals { margin-left: auto; width: 240px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #78716C; }
          .total-row.grand { border-top: 2px solid #1C1917; margin-top: 6px; padding-top: 8px; font-size: 14px; font-weight: 700; color: #1C1917; }

          /* COD badge */
          .cod-badge { display: inline-block; background: #FEF3C7; color: #92400E; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 2px; letter-spacing: 1px; text-transform: uppercase; margin-top: 16px; }

          /* Footer */
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E7E0D8; display: flex; justify-content: space-between; align-items: center; }
          .footer p { font-size: 10px; color: #78716C; }
          .thank-you { font-size: 13px; font-weight: 600; color: #C4856A; }

          /* Notes */
          .notes-box { background: #FAF7F2; border: 1px solid #E7E0D8; padding: 10px 14px; margin-top: 16px; }
          .notes-box label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #78716C; display: block; margin-bottom: 4px; }
          .notes-box p { font-size: 12px; color: #1C1917; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
      win.close()
    }, 300)
  }

  if (loading) return <div className="text-muted text-sm">Loading...</div>
  if (!order) return <div className="text-muted text-sm">Order not found</div>

  const items = order.items as any[]

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-xs text-muted hover:text-charcoal">← Back</button>
          <h1 className="font-display text-2xl font-bold">{order.order_number}</h1>
          <span className={`text-xs px-2 py-1 font-medium ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-rose text-white px-4 py-2 text-sm font-semibold hover:bg-rose-dark transition-colors"
        >
          <Printer size={15} />
          Print Invoice
        </button>
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
              <div className="flex justify-between text-sm text-muted"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-muted"><span>Shipping</span><span>{formatPrice(order.shipping_fee)}</span></div>
              <div className="flex justify-between text-sm font-bold text-charcoal"><span>Total (COD)</span><span>{formatPrice(order.total)}</span></div>
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
                <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{getOrderStatusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Tracking Number</label>
                <input value={tracking} onChange={e => setTracking(e.target.value)}
                  placeholder="TCS-123456789"
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
              </div>
              <div>
                <label className="block text-xs text-muted uppercase tracking-wide mb-1.5">Admin Notes</label>
                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  rows={3} placeholder="Internal notes..."
                  className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" />
              </div>
              <button onClick={handleSave} disabled={saving}
                className={`w-full py-2.5 text-sm font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-charcoal text-cream hover:bg-rose'} disabled:opacity-60`}>
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

      {/* Hidden Print Template */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="invoice">
          {/* Header: Brand (sender) left, Invoice title right */}
          <div className="header">
            <div>
              <div className="brand-name">{BRAND.name}</div>
              <div className="brand-tagline">{BRAND.tagline}</div>
              <div className="brand-contact">📞 {BRAND.phone}</div>
              <div className="brand-contact">✉ {BRAND.email}</div>
              <div className="brand-contact">📍 {BRAND.address}</div>
            </div>
            <div className="invoice-title">
              <h2>Order Invoice</h2>
              <p>{order.order_number}</p>
              <p>{new Date(order.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* From / To addresses */}
          <div className="addresses">
            <div className="address-box">
              <h4>From (Sender)</h4>
              <p className="name">{BRAND.name}</p>
              <p>{BRAND.address}</p>
              <p>📞 {BRAND.phone}</p>
            </div>
            <div className="address-box">
              <h4>To (Receiver)</h4>
              <p className="name">{order.customer_name}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.province}</p>
              <p>📞 {order.customer_phone}</p>
              {order.customer_email && <p>✉ {order.customer_email}</p>}
            </div>
          </div>

          {/* Order Meta */}
          <div className="order-meta">
            <div className="meta-item">
              <label>Order Number</label>
              <span>{order.order_number}</span>
            </div>
            <div className="meta-item">
              <label>Order Date</label>
              <span>{new Date(order.created_at).toLocaleDateString('en-PK')}</span>
            </div>
            <div className="meta-item">
              <label>Payment</label>
              <span>Cash on Delivery</span>
            </div>
          </div>

          {/* Items Table */}
          <table>
            <thead>
              <tr>
                <th style={{width:'50%'}}>Product</th>
                <th style={{width:'15%'}}>Qty</th>
                <th style={{width:'15%'}}>Unit Price</th>
                <th style={{width:'20%'}}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, i: number) => (
                <tr key={i}>
                  <td>{item.product_name}</td>
                  <td className="qty">{item.quantity}</td>
                  <td>{formatPrice(item.price)}</td>
                  <td>{formatPrice(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="totals">
            <div className="total-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="total-row"><span>Shipping</span><span>{formatPrice(order.shipping_fee)}</span></div>
            <div className="total-row grand"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>

          <div><span className="cod-badge">💵 Cash on Delivery — Collect {formatPrice(order.total)} at door</span></div>

          {/* Customer notes */}
          {order.notes && (
            <div className="notes-box">
              <label>Customer Notes</label>
              <p>{order.notes}</p>
            </div>
          )}

          {/* Tracking */}
          {order.tracking_number && (
            <div className="notes-box" style={{marginTop:'8px'}}>
              <label>Tracking Number</label>
              <p>{order.tracking_number}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <p>This is a system-generated invoice. No signature required.</p>
            <p className="thank-you">Thank you for your order! 🌸</p>
          </div>
        </div>
      </div>
    </div>
  )
}
