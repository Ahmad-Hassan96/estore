'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, PAKISTAN_CITIES, PAKISTAN_PROVINCES } from '@/lib/utils'
import type { CheckoutFormData } from '@/lib/types'

const emptyForm: CheckoutFormData = {
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  address: '',
  city: '',
  province: 'Punjab',
  notes: '',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, shippingFee, total, clearCart } = useCartStore()
  const [form, setForm] = useState<CheckoutFormData>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sub = subtotal()
  const ship = shippingFee()
  const tot = total()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl text-muted mb-4">Your cart is empty</p>
        <a href="/shop" className="text-rose underline text-sm">Shop Now</a>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.customer_name || !form.customer_phone || !form.address || !form.city) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerInfo: form,
          items,
          subtotal: sub,
          shippingFee: ship,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')

      clearCart()
      router.push(`/checkout/success?order=${data.order_number}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-5">Delivery Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Full Name *
                </label>
                <input
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Fatima Ahmed"
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Phone Number *
                </label>
                <input
                  name="customer_phone"
                  value={form.customer_phone}
                  onChange={handleChange}
                  required
                  placeholder="03XX-XXXXXXX"
                  type="tel"
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Email (optional)
                </label>
                <input
                  name="customer_email"
                  value={form.customer_email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@email.com"
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="House/Flat no., Street, Area, Landmark..."
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  City *
                </label>
                <select
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors bg-white"
                >
                  <option value="">Select city</option>
                  {PAKISTAN_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Province *
                </label>
                <select
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors bg-white"
                >
                  {PAKISTAN_PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">
                  Order Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Special instructions, preferred delivery time, etc."
                  className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Payment Method</h2>
            <div className="flex items-center gap-3 border border-charcoal p-4 bg-stone-50">
              <div className="w-4 h-4 rounded-full bg-charcoal flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="text-xs text-muted">Pay when your order arrives at your door</p>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-cream py-4 text-sm font-semibold tracking-wide hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing Order...' : `Place Order — ${formatPrice(tot)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white border border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-5">Order Summary</h2>

            <div className="space-y-4 mb-5">
              {items.map(item => (
                <div key={item.product_id} className="flex gap-3">
                  <div className="relative w-14 h-16 bg-stone-100 flex-shrink-0 overflow-hidden">
                    {item.image && (
                      <Image src={item.image} alt={item.product_name} fill className="object-cover" sizes="56px" />
                    )}
                    <span className="absolute -top-1 -right-1 bg-charcoal text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal leading-snug line-clamp-2">{item.product_name}</p>
                    <p className="text-sm text-muted mt-0.5">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span><span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span>{ship === 0 ? 'FREE' : formatPrice(ship)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-charcoal border-t border-border pt-2">
                <span className="font-display">Total</span>
                <span>{formatPrice(tot)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
