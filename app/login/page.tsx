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
  // We use the standard client here to ensure the handshake is secure
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This ensures they come back to the correct Bridge
        emailRedirectTo: `${location.origin}/auth/callback`,
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
      // THE FIX: Pointing exactly to Step 0, not just the folder
      router.push('/assessments/step0') 
      router.refresh()
    }
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
        
        <form className="space-y-6">
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
              {loading ? 'Processing...' : 'Sign In'}
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
