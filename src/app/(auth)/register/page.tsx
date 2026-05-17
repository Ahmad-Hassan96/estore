'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })

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
          <p className="text-muted text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border p-8 space-y-5">
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Fatima Ahmed' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@email.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '········' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.name]}
                onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                required
                placeholder={f.placeholder}
                className="w-full border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal"
              />
            </div>
          ))}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-cream py-3 text-sm font-semibold hover:bg-rose transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-charcoal hover:text-rose underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
