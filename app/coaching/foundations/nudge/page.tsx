'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { ShieldCheck, ArrowRight, LayoutGrid, CheckCircle } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function FoundationsNudge() {
  const [score, setScore] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchScore = async () => {
      const { data } = await supabase
        .from('quiz_submissions')
        .select('score')
        .eq('module_slug', 'foundations')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) setScore(data.score)
    }
    fetchScore()
  }, [supabase])

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto">
          
          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">Your Integration Strategy</h1>
            <p className="text-[#c9ccbb]/60 text-xl italic">
              Translating foundations into a regulated environment.
            </p>
          </header>

          <div className="grid gap-12 mb-20">
            {/* Action 1: Edge Density Audit */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <LayoutGrid size={28} />
                </div>
                <h3 className="text-2xl font-serif text-[#c9ccbb]">The Edge Density Audit</h3>
              </div>
              <p className="text-[#c9ccbb]/80 mb-8 leading-[1.8] text-lg">
                As identified in the module, high edge density increases theta band activity in the ACC. Identify the room where you spend the most cognitive energy. Look for sharp, fragmented visual patterns or excessive angular furniture.
              </p>
              <div className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Immediate Shift</span>
                <p className="text-lg text-[#c9ccbb]/70 italic leading-relaxed">Softening just one visual collision point (e.g., adding a textile over a sharp-edged desk or clearing a fragmented shelf) can reduce baseline vigilance.</p>
              </div>
            </div>

            {/* Action 2: Hormonal Support */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-serif text-[#c9ccbb]">Cortisol Mitigation</h3>
              </div>
              <p className="text-[#c9ccbb]/80 mb-8 leading-[1.8] text-lg">
                Nervous system regulation requires predictability. When sensory load is high, the HPA axis remains on low-grade alert.
              </p>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start text-lg text-[#c9ccbb]/80">
                  <CheckCircle size={24} className="text-[#b5a642] shrink-0 mt-1" /> 
                  <span>Audit for ghost inputs: Whirring electronics or subtle light leaks.</span>
                </li>
                <li className="flex gap-4 items-start text-lg text-[#c9ccbb]/80">
                  <CheckCircle size={24} className="text-[#b5a642] shrink-0 mt-1" /> 
                  <span>Group small objects into a single visual hierarchy.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-10">Ready for the next shift?</h4>
            <Link 
              href="/upgrade" 
              className="group flex items-center gap-4 px-14 py-6 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-full hover:bg-[#b5a642] transition-all shadow-2xl shadow-[#b5a642]/20"
            >
              Unlock Module 2: Sensory & Lighting Dynamics <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
