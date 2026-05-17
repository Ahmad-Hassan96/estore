import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { OrderStatus } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `PKR ${amount.toLocaleString('en-PK')}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

export const PAKISTAN_CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana',
  'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan', 'Gujrat',
  'Kasur', 'Mardan', 'Mingora', 'Nawabshah', 'Mirpur Khas', 'Other'
]

export const PAKISTAN_PROVINCES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Azad Jammu & Kashmir', 'Gilgit-Baltistan', 'Islamabad Capital Territory'
]

export const CATEGORIES = [
  { value: 'lawn', label: 'Lawn' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'chiffon', label: 'Chiffon' },
  { value: 'silk', label: 'Silk' },
  { value: 'linen', label: 'Linen' },
  { value: 'khaddar', label: 'Khaddar' },
  { value: 'karandi', label: 'Karandi' },
]

export const SHIPPING_FEE = 200
export const FREE_SHIPPING_ABOVE = 5000
