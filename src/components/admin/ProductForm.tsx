'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Upload, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatPrice, CATEGORIES } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    compare_price: product?.compare_price?.toString() || '',
    category: product?.category || 'lawn',
    collection: product?.collection || '',
    pieces: product?.pieces?.toString() || '3',
    fabric_details: product?.fabric_details || '',
    stock: product?.stock?.toString() || '0',
    tags: product?.tags?.join(', ') || '',
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
  })
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !isEdit ? { slug: slugify(value) } : {}),
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)

    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }

    setImages(prev => [...prev, ...uploaded])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = async (url: string) => {
    // Extract path from URL for deletion
    const supabase = createClient()
    const path = url.split('/product-images/')[1]
    if (path) await supabase.storage.from('product-images').remove([path])
    setImages(prev => prev.filter(img => img !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.price || !form.category) {
      setError('Name, price, and category are required.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category: form.category,
      collection: form.collection.trim() || null,
      gender: 'women',
      pieces: parseInt(form.pieces) as 2 | 3,
      fabric_details: form.fabric_details.trim() || null,
      stock: parseInt(form.stock) || 0,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_active: form.is_active,
      is_featured: form.is_featured,
      images,
    }

    let err
    if (isEdit) {
      const res = await supabase.from('products').update(payload).eq('id', product.id)
      err = res.error
    } else {
      const res = await supabase.from('products').insert(payload)
      err = res.error
    }

    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }

    router.push('/admin/products')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!isEdit || !confirm('Delete this product? This cannot be undone.')) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', product.id)
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {/* Basic Info */}
      <div className="bg-white border border-border p-6">
        <h2 className="font-display text-base font-semibold mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal font-mono text-xs" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Price (PKR) *</label>
            <input name="price" value={form.price} onChange={handleChange} type="number" min="0" required
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Compare Price (PKR)</label>
            <input name="compare_price" value={form.compare_price} onChange={handleChange} type="number" min="0"
              placeholder="Original price (for sale badge)"
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-white">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Collection</label>
            <input name="collection" value={form.collection} onChange={handleChange}
              placeholder="e.g. Eid Collection 2025"
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Pieces</label>
            <div className="flex gap-2">
              {['2', '3'].map(p => (
                <label key={p} className={`flex-1 text-center py-2 border text-sm cursor-pointer transition-colors ${form.pieces === p ? 'bg-charcoal text-cream border-charcoal' : 'border-border text-muted hover:border-charcoal'}`}>
                  <input type="radio" name="pieces" value={p} checked={form.pieces === p} onChange={handleChange} className="sr-only" />
                  {p}-Piece
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Stock</label>
            <input name="stock" value={form.stock} onChange={handleChange} type="number" min="0"
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Fabric Details</label>
            <textarea name="fabric_details" value={form.fabric_details} onChange={handleChange} rows={2}
              placeholder="e.g. Shirt: Embroidered Lawn, Dupatta: Chiffon, Trouser: Cotton"
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Tags (comma-separated)</label>
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="floral, embroidered, summer"
              className="w-full border border-border px-3 py-2 text-sm focus:outline-none focus:border-charcoal" />
          </div>
          <div className="flex items-center gap-6">
            {[
              { name: 'is_active', label: 'Active (visible in store)' },
              { name: 'is_featured', label: 'Featured on homepage' },
            ].map(f => (
              <label key={f.name} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name={f.name} checked={(form as any)[f.name]} onChange={handleChange}
                  className="w-4 h-4 accent-charcoal" />
                <span className="text-sm text-charcoal">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-border p-6">
        <h2 className="font-display text-base font-semibold mb-4">Product Images</h2>
        <p className="text-xs text-muted mb-4">First image will be the thumbnail. Upload multiple images.</p>

        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img, i) => (
            <div key={img} className="relative group">
              <div className="relative w-24 h-28 bg-stone-100 overflow-hidden">
                <Image src={img} alt={`Image ${i + 1}`} fill className="object-cover" sizes="96px" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-charcoal/70 text-white text-xs text-center py-0.5">Main</span>
                )}
              </div>
              <button type="button" onClick={() => removeImage(img)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-24 h-28 border-2 border-dashed border-border hover:border-rose flex flex-col items-center justify-center gap-1 text-muted hover:text-rose transition-colors disabled:opacity-50">
            <Upload size={18} />
            <span className="text-xs">{uploading ? 'Uploading...' : 'Add'}</span>
          </button>
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={handleImageUpload} />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="bg-charcoal text-cream px-8 py-2.5 text-sm font-semibold hover:bg-rose transition-colors disabled:opacity-60">
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 text-sm border border-border text-muted hover:border-charcoal hover:text-charcoal transition-colors">
          Cancel
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto px-6 py-2.5 text-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
            Delete Product
          </button>
        )}
      </div>
    </form>
  )
}
