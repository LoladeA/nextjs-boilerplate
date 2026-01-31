'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient } from '@/lib/useSupabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error.message)
    else router.push('/assessments')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900 px-6">
      <div className="max-w-md w-full bg-white/90 p-8 rounded-xl">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Welcome back</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-3 rounded border"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-3 rounded border"
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 mb-3">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-green-800 text-white py-3 rounded-lg"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
