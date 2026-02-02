'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase' // Adjust path if you named the folder/file differently

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClient()  // ← modern, cookie-aware client

  // Helper to build correct redirect URL (adapts local vs prod)
  const getRedirectURL = () => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 
                 (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    return `${base}/assessments/step0`
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the confirmation link.')
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
    } else {
      router.push('/assessments/step0')
      router.refresh()
    }
    setLoading(false)
  }

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    })
    
    if (error) {
      setMessage(error.message)
      setLoading(false)
    }
    // No need to handle success here — Supabase redirects to GitHub → callback → your app
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-[#c9ccbb] mb-12 opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest text-xs">
        ← Back to Clarity
      </Link>
      
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 md:p-14 shadow-2xl">
        <h2 className="text-3xl font-serif text-[#1b270e] mb-2 font-medium">Begin Your Shift</h2>
        <p className="text-[#1b270e]/60 mb-8 font-light italic">Access your Sensory Intelligence dashboard.</p>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#1b270e]/40 mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#1b270e]/40 mb-2 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#b5a642] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {message && <p className="text-sm text-[#1b270e] font-medium bg-[#1b270e]/5 p-3 rounded-lg italic">{message}</p>}

          <div className="flex flex-col gap-4 pt-4">
            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-4 bg-[#1b270e] text-[#c9ccbb] rounded-full font-medium hover:bg-[#1b270e]/90 transition-all active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Sign In with Email'}
            </button>

            <button 
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full py-4 bg-[#24292e] text-white rounded-full font-medium hover:bg-[#24292e]/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Sign In with GitHub'}
              {/* Optional: GitHub icon if you have lucide-react or similar installed */}
              {/* <GitHub className="w-5 h-5" /> */}
            </button>

            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-4 border border-[#1b270e]/20 text-[#1b270e] rounded-full font-medium hover:bg-[#1b270e]/5 transition-all"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
