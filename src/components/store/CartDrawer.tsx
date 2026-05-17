'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, shippingFee, total } = useCartStore()
  const sub = subtotal()
  const ship = shippingFee()
  const tot = total()

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-full sm:w-[420px] bg-cream z-50 flex flex-col shadow-2xl transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold">
            Your Cart {items.length > 0 && <span className="text-muted text-base">({items.length})</span>}
          </h2>
          <button onClick={closeCart} className="p-1 text-muted hover:text-charcoal transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <ShoppingBag size={40} className="text-muted/40" />
            <p className="font-display text-lg text-muted">Your cart is empty</p>
            <button
              onClick={closeCart}
              className="text-sm text-rose hover:text-rose-dark underline underline-offset-2"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map(item => (
                <div key={item.product_id} className="flex gap-4">
                  <Link
                    href={`/product/${item.product_slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 bg-stone-100 flex-shrink-0 overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-200" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product_slug}`}
                      onClick={closeCart}
                      className="font-display text-sm font-medium text-charcoal hover:text-rose line-clamp-2 leading-snug"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-muted mt-0.5">{formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1.5 text-muted hover:text-charcoal transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 text-muted hover:text-charcoal transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="text-xs text-muted hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="border-t border-border px-6 py-5 space-y-3">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted">
                <span>Shipping</span>
                <span>{ship === 0 ? 'FREE' : formatPrice(ship)}</span>
              </div>
              {ship > 0 && (
                <p className="text-xs text-rose">
                  Add {formatPrice(5000 - sub)} more for free shipping
                </p>
              )}
              <div className="flex justify-between font-semibold text-charcoal border-t border-border pt-3">
                <span className="font-display">Total</span>
                <span>{formatPrice(tot)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-charcoal text-cream text-sm font-medium text-center py-3.5 hover:bg-rose transition-colors duration-200"
              >
                Checkout — Cash on Delivery
              </Link>
              <button
                onClick={closeCart}
                className="block w-full text-center text-xs text-muted hover:text-charcoal py-1 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
