'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleOAuth = async (provider: 'google') => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      router.push('/assessments/step0')
      router.refresh()
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the confirmation link.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-[#c9ccbb] mb-12 opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest text-xs">
        ← Back to Clarity
      </Link>
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 shadow-2xl">
        <h2 className="text-3xl font-serif text-[#1b270e] mb-2 font-medium">Begin Your Shift</h2>
        <p className="text-[#1b270e]/60 mb-8 font-light italic">Access your Sensory Intelligence dashboard.</p>
        
        <button onClick={() => handleOAuth('google')} className="w-full mb-6 py-4 bg-white border border-[#1b270e]/10 text-[#1b270e] rounded-full font-medium hover:bg-[#f0f0f0] flex items-center justify-center gap-3">
           Continue with Google
        </button>

        <form className="space-y-4">
          <input type="email" className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642]" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <input type="password" className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642]" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {message && <p className="text-sm text-[#1b270e] font-medium bg-[#1b270e]/5 p-3 rounded-lg italic">{message}</p>}
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={handleSignIn} disabled={loading} className="w-full py-4 bg-[#1b270e] text-[#c9ccbb] rounded-full font-medium hover:bg-[#1b270e]/90 transition-all">{loading ? 'Processing...' : 'Sign In'}</button>
            <button onClick={handleSignUp} disabled={loading} type="button" className="w-full py-3 text-xs uppercase tracking-widest text-[#1b270e]/60 hover:text-[#1b270e]">No account? Create one</button>
          </div>
        </form>
      </div>
    </div>
  )
}
