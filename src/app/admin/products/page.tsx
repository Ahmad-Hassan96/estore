import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { Plus } from 'lucide-react'

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-charcoal text-cream px-4 py-2 text-sm font-medium hover:bg-rose transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-border">
            <tr>
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No products yet.{' '}
                  <Link href="/admin/products/new" className="text-rose underline">Add your first product</Link>
                </td>
              </tr>
            ) : products.map(product => (
              <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 bg-stone-100 flex-shrink-0 overflow-hidden">
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <div className="w-full h-full bg-stone-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-charcoal line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted">{product.pieces}pc · {product.collection || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted capitalize">{product.category}</td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium">{formatPrice(product.price)}</span>
                    {product.compare_price && (
                      <p className="text-xs text-muted line-through">{formatPrice(product.compare_price)}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock <= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 font-medium ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {product.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${product.id}`} className="text-xs text-rose hover:underline">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
