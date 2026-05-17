'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore()
  const isOnSale = product.compare_price && product.compare_price > product.price
  const isOutOfStock = product.stock === 0

  return (
    <div className={cn('group relative', className)}>
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="block overflow-hidden aspect-[3/4] bg-stone-100 relative">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-500 group-hover:scale-105',
              isOutOfStock && 'opacity-60'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-stone-200 flex items-center justify-center text-muted text-sm">
            No Image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="bg-rose text-white text-xs px-2 py-0.5 font-medium">SALE</span>
          )}
          {isOutOfStock && (
            <span className="bg-charcoal text-white text-xs px-2 py-0.5 font-medium">SOLD OUT</span>
          )}
          {product.is_featured && !isOnSale && !isOutOfStock && (
            <span className="bg-charcoal/80 text-white text-xs px-2 py-0.5 font-medium">FEATURED</span>
          )}
        </div>

        {/* Quick add */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault()
              addItem(product)
            }}
            className="absolute bottom-3 right-3 bg-cream text-charcoal p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-charcoal hover:text-cream shadow-md"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="pt-3">
        <p className="text-xs text-muted uppercase tracking-wider mb-0.5 capitalize">
          {product.category} · {product.pieces}pc
        </p>
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-display text-sm font-semibold text-charcoal leading-snug hover:text-rose transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-semibold text-charcoal">
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="text-xs text-muted line-through">
              {formatPrice(product.compare_price!)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
