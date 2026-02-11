'use client'

import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Lock, Bell, CreditCard, LogOut, CheckCircle, AlertCircle, ArrowUpRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Settings() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Password Form State
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Mock State for Notifications (Visual only for now)
  const [emailDigest, setEmailDigest] = useState(true)
  const [productUpdates, setProductUpdates] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
    }
    getUser()
  }, [supabase])

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." })
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: "Password must be at least 6 characters." })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: "Password updated successfully." })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Settings</h1>
            <p className="text-[#c9ccbb]/60">Manage your preferences.</p>
          </div>

          {/* 1. ACCOUNT */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642]">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#c9ccbb]">Account</h2>
              <p className="text-[#c9ccbb]/70 text-sm">{userEmail}</p>
            </div>
          </div>

          {/* 2. SUBSCRIPTION */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <CreditCard className="text-[#b5a642]" size={20} />
                 <h2 className="text-xl font-serif text-[#c9ccbb]">Subscription Plan</h2>
               </div>
               <span className="px-3 py-1 rounded-full bg-[#c9ccbb]/10 text-[#c9ccbb] text-xs font-bold uppercase tracking-widest">
                 Free Plan
               </span>
            </div>
            
            <div className="bg-[#000]/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-[#c9ccbb] font-bold text-sm mb-1">Sentient Membership</h3>
                <p className="text-[#c9ccbb]/70 text-xs">Unlock full sensory diagnostics and history.</p>
              </div>
              <Link 
                href="/upgrade"
                className="flex items-center gap-2 px-6 py-3 bg-[#b5a642] text-[#1b270e] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#d4c55e] transition-all"
              >
                Upgrade <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* 3. NOTIFICATIONS (Visual Toggles) */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="text-[#b5a642]" size={20} />
              <h2 className="text-xl font-serif text-[#c9ccbb]">Notifications</h2>
            </div>

            <div className="space-y-4">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#c9ccbb]/5 transition-colors">
                <div>
                   <div className="text-[#c9ccbb] text-sm font-bold">Weekly Digest</div>
                   <div className="text-[#c9ccbb]/70 text-xs">Summary of your nervous system logs.</div>
                </div>
                <button 
                  onClick={() => setEmailDigest(!emailDigest)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${emailDigest ? 'bg-[#b5a642]' : 'bg-[#c9ccbb]/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-[#1b270e] rounded-full transition-all ${emailDigest ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-[#c9ccbb]/5 transition-colors">
                <div>
                   <div className="text-[#c9ccbb] text-sm font-bold">Product Updates</div>
                   <div className="text-[#c9ccbb]/70 text-xs">News about new sensory features.</div>
                </div>
                <button 
                  onClick={() => setProductUpdates(!productUpdates)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${productUpdates ? 'bg-[#b5a642]' : 'bg-[#c9ccbb]/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-[#1b270e] rounded-full transition-all ${productUpdates ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* 4. SECURITY (Working Form) */}
          <div className="glass-panel p-8 rounded-3xl border border-[#c9ccbb]/10">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-[#b5a642]" size={20} />
              <h2 className="text-xl font-serif text-[#c9ccbb]">Security</h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div>
                <label className="block text-[#c9ccbb]/60 text-xs font-bold uppercase tracking-widest mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[#c9ccbb]/70 text-xs font-bold uppercase tracking-widest mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#000]/20 border border-[#c9ccbb]/10 rounded-xl p-4 text-[#c9ccbb] focus:outline-none focus:border-[#b5a642]/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              {/* MESSAGES */}
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading || !newPassword}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                  loading || !newPassword
                    ? 'bg-[#c9ccbb]/5 text-[#c9ccbb]/20 cursor-not-allowed'
                    : 'bg-[#b5a642] text-[#1b270e] hover:bg-[#d4c55e]'
                }`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* SIGN OUT */}
          <div className="pt-4 pb-8">
             <button 
               onClick={handleSignOut}
               className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-widest"
             >
               <LogOut size={16} /> Sign Out
             </button>
          </div>

        </div>
      </div>
    </div>
  )
}
