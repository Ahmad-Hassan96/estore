'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'
import { SHIPPING_FEE, FREE_SHIPPING_ABOVE } from './utils'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  subtotal: () => number
  shippingFee: () => number
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(i => i.product_id === product.id)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product_id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, {
              product_id: product.id,
              product_name: product.name,
              product_slug: product.slug,
              image: product.images[0] || '',
              price: product.price,
              quantity,
            }],
            isOpen: true,
          }
        })
      },

      removeItem: (productId) =>
        set(state => ({
          items: state.items.filter(i => i.product_id !== productId)
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.product_id === productId ? { ...i, quantity } : i
          )
        }))
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      shippingFee: () => {
        const sub = get().subtotal()
        return sub >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE
      },

      total: () => get().subtotal() + get().shippingFee(),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
