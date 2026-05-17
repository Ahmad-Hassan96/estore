import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service role client — bypasses RLS, server-side only
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerInfo, items, subtotal, shippingFee } = body

    // Validate required fields
    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }
    if (!customerInfo?.customer_name || !customerInfo?.customer_phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }
    if (!customerInfo?.address || !customerInfo?.city) {
      return NextResponse.json({ error: 'Address and city are required' }, { status: 400 })
    }

    // Try to get current user (optional — supports guest checkout)
    let userId: string | null = null
    try {
      const serverClient = await createServerClient()
      const { data: { user } } = await serverClient.auth.getUser()
      userId = user?.id || null
    } catch {
      // Guest checkout — no user session, that's fine
    }

    // Use admin client to bypass RLS for order insert
    const adminClient = createAdminClient()

    const orderData = {
      user_id: userId,
      customer_name: customerInfo.customer_name.trim(),
      customer_phone: customerInfo.customer_phone.trim(),
      customer_email: customerInfo.customer_email?.trim() || null,
      address: customerInfo.address.trim(),
      city: customerInfo.city,
      province: customerInfo.province || 'Punjab',
      notes: customerInfo.notes?.trim() || null,
      items,
      subtotal,
      shipping_fee: shippingFee ?? 200,
      total: subtotal + (shippingFee ?? 200),
      status: 'pending',
      payment_method: 'cod',
    }

    const { data: order, error } = await adminClient
      .from('orders')
      .insert(orderData)
      .select('order_number, id')
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      order_number: order.order_number,
      id: order.id,
    })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}