'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
// 🟢 FIXED: Added CheckCircle to the import list
import { ShieldCheck, ArrowRight, Lightbulb, LayoutGrid, CheckCircle } from 'lucide-react'
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
          
          <header className="mb-12">
            <h1 className="text-4xl font-serif text-[#c9ccbb] mb-4">Your Integration Strategy</h1>
            <p className="text-[#c9ccbb]/60 text-lg">
              Translating foundations into a regulated environment.
            </p>
          </header>

          <div className="grid gap-8 mb-16">
            {/* Action 1: Edge Density Audit */}
            <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/20 bg-[#b5a642]/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-xl font-serif text-[#c9ccbb]">The Edge Density Audit</h3>
              </div>
              <p className="text-[#c9ccbb]/80 mb-6 leading-relaxed">
                As identified in the module, high edge density increases theta band activity in the ACC. Identify the room where you spend the most cognitive energy. Look for sharp, fragmented visual patterns or excessive angular furniture.
              </p>
              <div className="bg-[#1b270e]/40 p-6 rounded-xl border border-[#c9ccbb]/10">
                <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-2">Immediate Shift</span>
                <p className="text-sm text-[#c9ccbb]/70 italic">Softening just one visual "collision point" (e.g., adding a textile over a sharp-edged desk or clearing a fragmented shelf) can reduce baseline vigilance.</p>
              </div>
            </div>

            {/* Action 2: Hormonal Support */}
            <div className="glass-panel p-8 rounded-3xl border border-[#b5a642]/20 bg-[#b5a642]/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-serif text-[#c9ccbb]">Cortisol Mitigation</h3>
              </div>
              <p className="text-[#c9ccbb]/80 mb-6 leading-relaxed">
                Nervous system regulation requires predictability. When sensory load is high, the HPA axis remains on low-grade alert.
              </p>
              <ul className="space-y-3 text-sm text-[#c9ccbb]/70">
                <li className="flex gap-3"><CheckCircle size={16} className="text-[#b5a642] shrink-0" /> Audit for "ghost" inputs: Whirring electronics or subtle light leaks.</li>
                <li className="flex gap-3"><CheckCircle size={16} className="text-[#b5a642] shrink-0" /> Group small objects into a single visual hierarchy.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-16">
            <h4 className="text-[#c9ccbb] font-serif text-2xl mb-6">Ready for the next shift?</h4>
            <Link 
              href="/coaching/sensory-lighting" 
              className="group flex items-center gap-3 px-12 py-5 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-full hover:bg-[#b5a642] transition-all"
            >
              Unlock Module 1: Sensory & Lighting <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
