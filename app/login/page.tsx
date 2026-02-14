'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [origin, setOrigin] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Dynamic URL Detection (Works for Localhost & Production)
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // GITHUB SIGN IN (Redirects to Dashboard)
  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  // EMAIL SIGN IN (Redirects to Dashboard)
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
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center px-6 font-sans">
      
      {/* Back Link */}
      <Link href="/" className="absolute top-8 left-8 text-[#c9ccbb]/50 hover:text-[#c9ccbb] transition-colors uppercase tracking-widest text-xs font-bold">
        ← Back to Clarity
      </Link>
      
      {/* THE BEIGE CARD */}
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-black/20 text-[#1b270e]">
        
        <h2 className="text-3xl font-serif mb-2 font-medium">Begin Your Shift</h2>
        <p className="opacity-60 mb-8 font-light italic">Access your Sensory Intelligence dashboard.</p>
        
        {/* GitHub Button */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuth('github')}
            className="w-full py-4 bg-[#24292e] text-white rounded-full font-medium hover:bg-[#2f363d] transition-all flex items-center justify-center gap-3"
          >
             Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6 opacity-30">
          <div className="h-px bg-[#1b270e] flex-1"></div>
          <span className="text-xs uppercase font-bold tracking-widest">Or with email</span>
          <div className="h-px bg-[#1b270e] flex-1"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <input 
            type="email" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          <input 
            type="password" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          {message && <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-lg text-center">{message}</p>}

          <div className="flex flex-col gap-3 pt-4">
            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#1b270e] text-[#c9ccbb] rounded-full font-bold hover:bg-[#1b270e]/90 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            
            {/* Sign Up Link - Points to your separate Signup page */}
            <Link 
              href="/signup"
              className="w-full py-3 text-xs uppercase tracking-widest text-center text-[#1b270e]/60 hover:text-[#1b270e] transition-colors font-bold"
            >
              No account? Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
