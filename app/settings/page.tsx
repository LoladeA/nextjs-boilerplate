'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, LogOut, Shield, CreditCard, Bell, ChevronRight, Mail } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Link from 'next/link'

export default function Settings() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="min-h-screen bg-[#1b270e]" />

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Settings</h1>
        <p className="text-[#c9ccbb]/60 mb-12">Manage your profile, subscription, and preferences.</p>

        <div className="max-w-2xl space-y-6">
          
          {/* PROFILE CARD */}
          <div className="glass-panel p-8 rounded-2xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 flex items-center justify-center text-[#b5a642]">
              <User size={32} />
            </div>
            <div className="flex-grow">
              <h3 className="text-[#c9ccbb] text-lg font-bold">Account Profile</h3>
              <div className="flex items-center gap-2 text-[#c9ccbb]/60 text-sm mt-1">
                <Mail size={14} />
                {user?.email}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#b5a642]/10 text-[#b5a642] text-xs font-bold uppercase tracking-widest">
              Active
            </span>
          </div>

          {/* MENU OPTIONS */}
          <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-[#c9ccbb]/10">
            
            <button className="w-full flex items-center justify-between p-6 hover:bg-[#c9ccbb]/5 transition-colors group text-left">
              <div className="flex items-center gap-4">
                <Shield className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors" size={20} />
                <div>
                  <h4 className="text-[#c9ccbb] font-medium">Password & Security</h4>
                  <p className="text-[#c9ccbb]/40 text-xs mt-1">Update your login credentials</p>
                </div>
              </div>
              <ChevronRight className="text-[#c9ccbb]/20" size={16} />
            </button>

            <button className="w-full flex items-center justify-between p-6 hover:bg-[#c9ccbb]/5 transition-colors group text-left">
              <div className="flex items-center gap-4">
                <CreditCard className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors" size={20} />
                <div>
                  <h4 className="text-[#c9ccbb] font-medium">Subscription Plan</h4>
                  <p className="text-[#c9ccbb]/40 text-xs mt-1">Manage your NeuroDesign™ Access</p>
                </div>
              </div>
              <ChevronRight className="text-[#c9ccbb]/20" size={16} />
            </button>

            <button className="w-full flex items-center justify-between p-6 hover:bg-[#c9ccbb]/5 transition-colors group text-left">
              <div className="flex items-center gap-4">
                <Bell className="text-[#c9ccbb]/40 group-hover:text-[#b5a642] transition-colors" size={20} />
                <div>
                  <h4 className="text-[#c9ccbb] font-medium">Notifications</h4>
                  <p className="text-[#c9ccbb]/40 text-xs mt-1">Email preferences & alerts</p>
                </div>
              </div>
              <ChevronRight className="text-[#c9ccbb]/20" size={16} />
            </button>
          </div>

          {/* DANGER ZONE / LOGOUT */}
          <button 
            onClick={handleSignOut}
            className="w-full p-6 rounded-2xl border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={16} /> Sign Out
          </button>
          
          <p className="text-center text-[#c9ccbb]/20 text-xs pt-4">
            The Sentient Home v1.0 • ID: {user?.id?.slice(0, 8)}
          </p>

        </div>
      </div>
    </div>
  )
}
