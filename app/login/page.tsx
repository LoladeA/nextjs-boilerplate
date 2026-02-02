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

  // 🔴 HARDCODED PRODUCTION URL (Your specific Vercel domain)
  const SITE_URL = 'https://nextjs-boilerplate-six-chi-87.vercel.app'

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // This ensures the user returns to the correct live site after GitHub login
        redirectTo: `${SITE_URL}/auth/callback`,
      },
    })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      router.push('/Dashboard')
      router.refresh()
    }
  }

  const handleSignUp = async () => {
    setLoading(true)
    // 1. Sign up with the specific redirect URL so the email link works
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
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
      
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 md:p-14 shadow-2xl">
        <h2 className="text-3xl font-serif text-[#1b270e] mb-2 font-medium">Begin Your Shift</h2>
        <p className="text-[#1b270e]/60 mb-8 font-light italic">Access your Sensory Intelligence dashboard.</p>
        
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuth('github')}
            className="w-full py-4 bg-[#24292e] text-white rounded-full font-medium hover:bg-[#2f363d] transition-all flex items-center justify-center gap-3"
          >
             Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6 opacity-30">
          <div className="h-px bg-[#1b270e] flex-1"></div>
          <span className="text-xs uppercase text-[#1b270e]">Or with email</span>
          <div className="h-px bg-[#1b270e] flex-1"></div>
        </div>

        <form className="space-y-4">
          <input 
            type="email" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642] placeholder-[#1b270e]/30"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          <input 
            type="password" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642] placeholder-[#1b270e]/30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          {message && <p className="text-sm text-[#1b270e] font-medium bg-[#1b270e]/5 p-3 rounded-lg italic">{message}</p>}

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-4 bg-[#1b270e] text-[#c9ccbb] rounded-full font-medium hover:bg-[#1b270e]/90 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              type="button"
              className="w-full py-3 text-xs uppercase tracking-widest text-[#1b270e]/60 hover:text-[#1b270e] transition-colors"
            >
              No account? Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
