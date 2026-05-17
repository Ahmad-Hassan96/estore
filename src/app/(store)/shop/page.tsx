import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/store/ProductCard'
import type { Product } from '@/lib/types'
import { CATEGORIES } from '@/lib/utils'
import Link from 'next/link'

interface ShopPageProps {
  searchParams: {
    category?: string
    collection?: string
    featured?: string
    pieces?: string
    sort?: string
    page?: string
  }
}

const PER_PAGE = 12

async function getProducts(searchParams: ShopPageProps['searchParams']): Promise<{ products: Product[]; count: number }> {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .eq('gender', 'women')

  if (searchParams.category) query = query.eq('category', searchParams.category)
  if (searchParams.collection) query = query.ilike('collection', `%${searchParams.collection}%`)
  if (searchParams.featured === 'true') query = query.eq('is_featured', true)
  if (searchParams.pieces) query = query.eq('pieces', parseInt(searchParams.pieces))

  const sort = searchParams.sort || 'newest'
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'price-asc') query = query.order('price', { ascending: true })
  else if (sort === 'price-desc') query = query.order('price', { ascending: false })
  else if (sort === 'featured') query = query.order('is_featured', { ascending: false })

  query = query.range(from, to)

  const { data, count } = await query
  return { products: data || [], count: count || 0 }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { products, count } = await getProducts(searchParams)
  const page = parseInt(searchParams.page || '1')
  const totalPages = Math.ceil(count / PER_PAGE)

  const activeCategory = searchParams.category || ''
  const activeSort = searchParams.sort || 'newest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">
          {activeCategory ? CATEGORIES.find(c => c.value === activeCategory)?.label : "Women's Collection"}
        </h1>
        <p className="text-muted text-sm">{count} products</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          {/* Category */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-3">Category</h3>
            <div className="space-y-2">
              <Link
                href="/shop"
                className={`block text-sm py-0.5 ${!activeCategory ? 'text-charcoal font-medium' : 'text-muted hover:text-charcoal'}`}
              >
                All
              </Link>
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.value}
                  href={`/shop?category=${cat.value}${activeSort !== 'newest' ? `&sort=${activeSort}` : ''}`}
                  className={`block text-sm py-0.5 ${activeCategory === cat.value ? 'text-charcoal font-medium' : 'text-muted hover:text-charcoal'}`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Pieces */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal mb-3">Pieces</h3>
            <div className="space-y-2">
              {[
                { value: '', label: 'All' },
                { value: '2', label: '2-Piece' },
                { value: '3', label: '3-Piece' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/shop?${activeCategory ? `category=${activeCategory}&` : ''}${opt.value ? `pieces=${opt.value}` : ''}`}
                  className={`block text-sm py-0.5 ${searchParams.pieces === opt.value || (!searchParams.pieces && !opt.value) ? 'text-charcoal font-medium' : 'text-muted hover:text-charcoal'}`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Sort:</span>
              <div className="flex gap-1">
                {[
                  { value: 'newest', label: 'Newest' },
                  { value: 'price-asc', label: 'Price ↑' },
                  { value: 'price-desc', label: 'Price ↓' },
                ].map(opt => (
                  <Link
                    key={opt.value}
                    href={`/shop?${activeCategory ? `category=${activeCategory}&` : ''}sort=${opt.value}`}
                    className={`text-xs px-3 py-1.5 border transition-colors ${activeSort === opt.value ? 'bg-charcoal text-cream border-charcoal' : 'border-border text-muted hover:border-charcoal hover:text-charcoal'}`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl text-muted mb-4">No products found</p>
              <Link href="/shop" className="text-sm text-rose underline underline-offset-4">Clear filters</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <Link
                      key={p}
                      href={`/shop?${activeCategory ? `category=${activeCategory}&` : ''}sort=${activeSort}&page=${p}`}
                      className={`w-9 h-9 flex items-center justify-center text-sm border transition-colors ${page === p ? 'bg-charcoal text-cream border-charcoal' : 'border-border text-muted hover:border-charcoal'}`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
