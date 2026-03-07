'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [origin, setOrigin] = useState('')
  
  const [view, setView] = useState<'signin' | 'signup'>('signin')
  const searchParams = useSearchParams()
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setOrigin(window.location.origin)
    if (searchParams.get('view') === 'signup') {
      setView('signup')
    }
  }, [searchParams])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (view === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
        },
      })
      if (error) setMessage(error.message)
      else setMessage('You are in! Check your email to confirm and you are all set.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setMessage(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center px-6 font-sans">
      
      {/* Back Link */}
      <Link href="/" className="absolute top-8 left-8 text-[#c9ccbb]/50 hover:text-[#c9ccbb] transition-colors uppercase tracking-widest text-xs font-bold">
        ← Back to Clarity
      </Link>
      
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-black/20 text-[#1b270e]">
        
        <h2 className="text-3xl font-serif mb-2 font-medium">
          {view === 'signin' ? 'Welcome Back' : 'Begin Your Shift'}
        </h2>
        <p className="opacity-60 mb-8 font-light italic">
          {view === 'signin' ? 'Access your dashboard.' : 'Create your Sensory Intelligence account.'}
        </p>

        {/* Social auth — coming soon */}
        <div className="space-y-3 mb-6">
          {[
            { label: 'Continue with Google', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#9ca3af"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#9ca3af"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#9ca3af"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#9ca3af"/>
              </svg>
            )},
            { label: 'Continue with Apple', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            )},
            { label: 'Continue with LinkedIn', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            )},
          ].map(({ label, icon }) => (
            <div key={label} className="relative">
              <button
                type="button"
                disabled
                className="w-full py-3.5 bg-[#1b270e]/5 text-[#1b270e]/30 rounded-full font-medium flex items-center justify-center gap-3 cursor-not-allowed border border-[#1b270e]/10"
              >
                {icon}
                {label}
              </button>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-[#1b270e]/25">
                Coming Soon
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6 opacity-30">
          <div className="h-px bg-[#1b270e] flex-1"></div>
          <span className="text-xs uppercase font-bold tracking-widest">Or with email</span>
          <div className="h-px bg-[#1b270e] flex-1"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <input 
            type="password" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {message && (
            <p className={`text-sm font-medium p-3 rounded-lg text-center ${
              message.includes('Check') ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'
            }`}>
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#1b270e] text-[#c9ccbb] rounded-full font-bold hover:bg-[#1b270e]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (view === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                setView(view === 'signin' ? 'signup' : 'signin')
                setMessage('')
              }}
              className="w-full py-3 text-xs uppercase tracking-widest text-center text-[#1b270e]/60 hover:text-[#1b270e] transition-colors font-bold"
            >
              {view === 'signin' ? 'No account? Create one' : 'Already have an account? Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
