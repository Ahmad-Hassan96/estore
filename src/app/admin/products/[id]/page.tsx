import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  )
}
