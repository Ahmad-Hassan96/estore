export type Gender = 'women' | 'men' | 'unisex'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type Category =
  | 'lawn'
  | 'cotton'
  | 'chiffon'
  | 'silk'
  | 'linen'
  | 'khaddar'
  | 'karandi'

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_price: number | null
  gender: Gender
  category: Category
  collection: string | null
  tags: string[]
  pieces: 2 | 3
  fabric_details: string | null
  images: string[]
  stock: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  product_slug: string
  image: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  address: string
  city: string
  province: string
  items: OrderItem[]
  subtotal: number
  shipping_fee: number
  total: number
  status: OrderStatus
  payment_method: 'cod'
  notes: string | null
  tracking_number: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  default_city: string | null
  default_address: string | null
  default_province: string
  role: 'customer' | 'admin'
}

export interface CartItem {
  product_id: string
  product_name: string
  product_slug: string
  image: string
  price: number
  quantity: number
}

export interface CheckoutFormData {
  customer_name: string
  customer_phone: string
  customer_email: string
  address: string
  city: string
  province: string
  notes: string
}
