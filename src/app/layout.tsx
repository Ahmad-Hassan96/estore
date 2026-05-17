import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'BRAND NAME | Women\'s Unstitched Collection',
    template: '%s | BRAND NAME',
  },
  description: 'Discover premium women\'s unstitched fabric — Lawn, Cotton, Chiffon, Silk & more. Free shipping above PKR 5,000.',
  keywords: ['unstitched', 'women', 'lawn', 'cotton', 'chiffon', 'Pakistan', 'fabric'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-cream text-charcoal antialiased">
        {children}
      </body>
    </html>
  )
}
