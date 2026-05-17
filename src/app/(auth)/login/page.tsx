'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold tracking-widest uppercase text-charcoal">
            BRAND NAME
          </Link>
          <p className="text-muted text-sm mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-cream py-3 text-sm font-semibold hover:bg-rose transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-charcoal hover:text-rose underline underline-offset-2">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
