'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ChevronLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice, cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/store/ProductCard'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (data) {
        setProduct(data)
        // Load related
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(4)
        setRelated(rel || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-stone-200" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-stone-200 w-24" />
            <div className="h-8 bg-stone-200 w-3/4" />
            <div className="h-6 bg-stone-200 w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="font-display text-2xl text-muted mb-4">Product not found</p>
        <Link href="/shop" className="text-rose underline">Back to Shop</Link>
      </div>
    )
  }

  const isOnSale = product.compare_price && product.compare_price > product.price
  const isOutOfStock = product.stock === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted mb-8">
        <Link href="/" className="hover:text-charcoal">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-charcoal">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-charcoal capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-charcoal line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Images */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex flex-col gap-2 w-16 flex-shrink-0">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'relative aspect-square overflow-hidden border-2 transition-colors',
                    activeImage === i ? 'border-charcoal' : 'border-transparent hover:border-stone-300'
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 relative aspect-[3/4] bg-stone-100 overflow-hidden">
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
            )}
            {isOnSale && (
              <span className="absolute top-4 left-4 bg-rose text-white text-xs px-2 py-1 font-medium">SALE</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="py-2">
          <p className="text-xs text-muted uppercase tracking-wider mb-2 capitalize">
            {product.category} · {product.pieces}-Piece Unstitched
          </p>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-charcoal">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-lg text-muted line-through">{formatPrice(product.compare_price!)}</span>
            )}
            {isOnSale && (
              <span className="text-sm bg-rose/10 text-rose px-2 py-0.5 font-medium">
                Save {formatPrice(product.compare_price! - product.price)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={cn('w-2 h-2 rounded-full', isOutOfStock ? 'bg-red-400' : product.stock <= 5 ? 'bg-yellow-400' : 'bg-green-400')} />
            <span className="text-sm text-muted">
              {isOutOfStock ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
            </span>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold tracking-wide transition-all duration-200 mb-4',
              isOutOfStock
                ? 'bg-stone-200 text-muted cursor-not-allowed'
                : added
                ? 'bg-green-600 text-white'
                : 'bg-charcoal text-cream hover:bg-rose'
            )}
          >
            <ShoppingBag size={18} />
            {isOutOfStock ? 'Out of Stock' : added ? 'Added to Cart!' : 'Add to Cart'}
          </button>

          {/* COD note */}
          <div className="flex items-center gap-2 text-xs text-muted bg-stone-50 border border-border p-3 mb-6">
            <Package size={14} />
            <span>Cash on Delivery · Free shipping above PKR 5,000 · 3–5 business days</span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-muted leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Fabric Details */}
          {product.fabric_details && (
            <div className="mb-4 border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider mb-2">Fabric Details</h3>
              <p className="text-sm text-muted leading-relaxed">{product.fabric_details}</p>
            </div>
          )}

          {/* Collection tag */}
          {product.collection && (
            <div className="border-t border-border pt-4">
              <span className="text-xs text-muted">Collection: </span>
              <span className="text-xs text-charcoal font-medium">{product.collection}</span>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
