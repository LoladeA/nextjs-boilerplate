'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/app/components/Sidebar'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, Lock, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Module2Page() {
  const supabase   = createClientComponentClient()
  const router     = useRouter()
  const [loading, setLoading]             = useState(true)
  const [isAuthorized, setIsAuthorized]   = useState(false)
  const [currentModule, setCurrentModule] = useState(1)

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        if (user.email === 'christchilde@gmail.com') {
          setIsAuthorized(true); setLoading(false); return
        }

        const [profileRes, statusRes] = await Promise.all([
          supabase.from('users').select('current_module').eq('id', user.id).single(),
          fetch('/api/subscription-status')
        ])

        const mod = profileRes.data?.current_module ?? 1
        setCurrentModule(mod)
        const { tier } = await statusRes.json()
        setIsAuthorized(tier === 'blueprint' && 2 <= mod)
      } catch {
        setIsAuthorized(false)
      } finally {
        setLoading(false)
      }
    }
    checkAccess()
  }, [supabase, router])

  if (loading) return (
    <div className="min-h-screen bg-[#1b270e] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#b5a642]" size={28} />
    </div>
  )

  if (!isAuthorized) return (
    <div className="min-h-screen bg-[#1b270e] font-sans flex flex-col items-center justify-center text-center p-12">
      <div className="w-16 h-16 rounded-full bg-[#b5a642]/10 border border-[#b5a642]/30 flex items-center justify-center mb-6">
        <Lock size={26} className="text-[#b5a642]" />
      </div>
      <p className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest mb-3">Blueprint Feature</p>
      <h2 className="text-2xl font-serif text-[#c9ccbb] mb-4 max-w-sm leading-snug">
        {currentModule < 2
          ? 'Complete Module 1 to unlock this module.'
          : 'Blueprint membership required.'}
      </h2>
      <div className="flex gap-6 mt-4">
        <Link href="/coaching" className="text-[#c9ccbb]/60 text-xs uppercase tracking-widest font-bold hover:text-[#c9ccbb] transition-colors flex items-center gap-2">
          <ChevronLeft size={14} /> Coaching
        </Link>
        <Link href="/upgrade" className="text-[#b5a642] text-xs uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-2">
          Upgrade to Blueprint <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-3xl mx-auto text-[#c9ccbb]">

          <Link href="/coaching" className="inline-flex items-center gap-2 text-[#c9ccbb]/50 hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors mb-10">
            <ChevronLeft size={14} /> Coaching
          </Link>

          <header className="mb-14 border-l-4 border-[#b5a642] pl-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#b5a642]/30 text-[#b5a642] bg-[#b5a642]/10">
                Module 2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#c9ccbb]/15 text-[#c9ccbb]/40">
                Blueprint
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mb-3 leading-tight">
              Sensory and Lighting Dynamics
            </h1>
            <p className="text-[#c9ccbb]/60 text-sm leading-relaxed">
              Understanding Sensory Load: Beyond the Obvious.
            </p>
          </header>

          <div
            className="h-px w-full mb-10"
            style={{ background: 'linear-gradient(90deg, rgba(181,166,66,0.40) 0%, rgba(181,166,66,0.05) 100%)' }}
          />

          <div className="space-y-3 mb-14">
            {[
              { n: 1, label: 'Understanding Sensory Load: Beyond the Obvious' },
              { n: 2, label: 'Circadian Stability & Sensory Filtering' },
              { n: 3, label: 'Designing for Regulation (Not Aesthetics)' },
              { n: 4, label: 'The Evening Reset & Deep Night Setting' },
            ].map(({ n, label }) => (
              <Link
                key={n}
                href={`/coaching/sensory-lighting-dynamics/week-${n}`}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-[#c9ccbb]/10 bg-[#000]/15 hover:border-[#b5a642]/40 hover:bg-[#b5a642]/5 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full border border-[#b5a642]/30 bg-[#b5a642]/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#b5a642]">
                  {n}
                </div>
                <div className="flex-1">
                  <span className="text-[#c9ccbb]/80 text-sm leading-snug group-hover:text-[#c9ccbb] transition-colors">
                    Week {n}: {label}
                  </span>
                </div>
                <ArrowRight size={14} className="text-[#b5a642]/40 group-hover:text-[#b5a642] group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>

          <div
            className="flex items-center justify-between pt-8"
            style={{ borderTop: '1px solid rgba(181,166,66,0.15)' }}
          >
            <Link href="/coaching/foundations" className="flex items-center gap-2 text-[#c9ccbb]/50 hover:text-[#b5a642] text-[10px] font-bold uppercase tracking-widest transition-colors">
              <ChevronLeft size={13} /> Module 1
            </Link>
            <Link href="/coaching/acoustic-balance" className="flex items-center gap-2 text-[#b5a642] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">
              Module 3 <ArrowRight size={13} />
            </Link>
          </div>

        </div>
      </main>
    </div>
  )
}
