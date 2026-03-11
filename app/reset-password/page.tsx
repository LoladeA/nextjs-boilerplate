'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Password updated successfully! Redirecting to sign in...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center px-6 font-sans">
      <div className="w-full max-w-md bg-[#c9ccbb] rounded-[2rem] p-10 md:p-14 shadow-2xl shadow-black/20 text-[#1b270e]">
        
        <h2 className="text-3xl font-serif mb-2 font-medium">Set New Password</h2>
        <p className="opacity-60 mb-8 font-light italic">Enter your new password below.</p>

        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
          />
          <input 
            type="password" 
            className="w-full bg-transparent border-b border-[#1b270e]/20 py-3 px-1 text-[#1b270e] focus:outline-none focus:border-[#1b270e] placeholder-[#1b270e]/30 transition-colors"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            required
          />

          {message && (
            <p className={`text-sm font-medium p-3 rounded-lg text-center ${
              message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
            
            <Link 
              href="/login"
              className="w-full py-2 text-xs uppercase tracking-widest text-center text-[#1b270e]/40 hover:text-[#1b270e] transition-colors font-bold"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
