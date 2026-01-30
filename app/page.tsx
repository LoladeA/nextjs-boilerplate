'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSignup() {
    setError(null)
    const { error } = await supabaseBrowser.auth.signUp({ email, password })
    if (error) setError(error.message)
    else router.push('/assessments')
  }

  return (
    <div className="min-h-screen bg-green-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/90 p-8 rounded-xl">
        <h1 className="text-2xl font-semibold mb-2 text-gray-900">Begin gently</h1>
        <p className="text-gray-600 mb-6">Your Home Is Your Nervous System's Second Skin.</p>

        <input type="email" placeholder="Email" className="w-full mb-3 p-3 rounded border" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full mb-4 p-3 rounded border" onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-600 mb-3">{error}</p>}

        <button onClick={handleSignup} className="w-full bg-green-800 text-white py-3 rounded-lg">Create account</button>
      </div>
    </div>
  )
}
