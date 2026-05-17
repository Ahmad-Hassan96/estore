import Link from 'next/link'
import { CheckCircle2, Package, Phone } from 'lucide-react'

interface SuccessPageProps {
  searchParams: { order?: string }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.order || 'N/A'

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <CheckCircle2 size={56} className="text-green-500" />
      </div>

      <h1 className="font-display text-4xl font-bold mb-3">Order Placed!</h1>
      <p className="text-muted text-lg mb-6">Thank you for shopping with us.</p>

      <div className="bg-white border border-border p-6 mb-8 text-left">
        <div className="text-center mb-5">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">Your Order Number</p>
          <p className="font-display text-2xl font-bold text-charcoal">{orderNumber}</p>
        </div>

        <div className="border-t border-border pt-5 space-y-4">
          <div className="flex gap-3">
            <Phone size={18} className="text-rose flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-charcoal">We will call to confirm</p>
              <p className="text-sm text-muted">Our team will contact you within 24 hours to confirm your order and delivery details.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Package size={18} className="text-rose flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-charcoal">Estimated Delivery</p>
              <p className="text-sm text-muted">3–5 business days after confirmation. Cash payment collected at delivery.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="bg-charcoal text-cream px-8 py-3 text-sm font-semibold hover:bg-rose transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account"
          className="border border-border text-charcoal px-8 py-3 text-sm font-semibold hover:border-charcoal transition-colors"
        >
          My Orders
        </Link>
      </div>
    </div>
  )
}
