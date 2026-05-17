import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'
import { CATEGORIES } from '@/lib/utils'

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

async function getNewArrivals(): Promise<Product[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return data || []
}

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] bg-stone-200 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/60 via-charcoal/40 to-transparent z-10" />
        {/* Replace this div with an <Image> once you have a hero photo */}
        <div className="absolute inset-0 bg-[url('/hero-placeholder.jpg')] bg-cover bg-center" />

        <div className="relative z-20 text-center text-cream px-4 animate-fade-in">
          <p className="text-sm tracking-[0.3em] uppercase text-rose-light mb-4 font-body">
            Women&apos;s Unstitched Collection
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6">
            Draped in <br />
            <span className="italic text-rose-light">Elegance</span>
          </h1>
          <p className="font-body text-cream/80 text-lg mb-10 max-w-md mx-auto">
            Premium unstitched fabrics for the modern Pakistani woman. Lawn, Cotton, Chiffon & more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-cream text-charcoal px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-rose hover:text-cream transition-all duration-200"
            >
              Shop Now
            </Link>
            <Link
              href="/shop?collection=new"
              className="border border-cream text-cream px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-cream/10 transition-all duration-200"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Category Strip */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.value}
                href={`/shop?category=${cat.value}`}
                className="flex-shrink-0 px-6 py-4 text-sm font-medium text-muted hover:text-charcoal hover:bg-cream transition-colors border-r border-border last:border-r-0 whitespace-nowrap"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-rose uppercase tracking-[0.2em] mb-1">Handpicked</p>
              <h2 className="font-display text-3xl font-bold">Featured Pieces</h2>
            </div>
            <Link href="/shop?featured=true" className="text-sm text-muted hover:text-charcoal underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Shipping Banner */}
      <section className="bg-rose text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-sm font-medium text-center">
            <span>🚚 Free Shipping on orders above PKR 5,000</span>
            <span>📦 Cash on Delivery — Nationwide</span>
            <span>⏱ 3–5 Business Days Delivery</span>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs text-rose uppercase tracking-[0.2em] mb-1">Just In</p>
              <h2 className="font-display text-3xl font-bold">New Arrivals</h2>
            </div>
            <Link href="/shop" className="text-sm text-muted hover:text-charcoal underline underline-offset-4">
              Shop all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="bg-charcoal text-cream py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="text-xs text-rose-light uppercase tracking-[0.3em] mb-4">Our Story</p>
          <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
            Fabric that tells a story
          </h2>
          <p className="text-cream/70 leading-relaxed text-lg">
            We believe every woman deserves fabric that speaks to her soul. Our curated collection of premium unstitched fabrics brings together the finest lawns, cottons, and chiffons — each piece chosen for its quality, colour, and craft.
          </p>
        </div>
      </section>
    </div>
  )
}
