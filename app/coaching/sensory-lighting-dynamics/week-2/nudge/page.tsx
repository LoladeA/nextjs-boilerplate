'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
// 🟢 FIXED: Added 'Clock' and 'Lightbulb' to imports (They were missing and would cause a crash)
import { ArrowRight, CheckCircle, Eye, Zap, Clock, Lightbulb } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week2Nudge() {
  const [score, setScore] = useState<number | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchScore = async () => {
      const { data } = await supabase
        .from('quiz_submissions')
        .select('score')
        .eq('module_id', 'sensory-lighting-dynamics-week-2') 
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
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">
          
          <header className="mb-20">
            {/* 🟢 FIXED: Updated Header naming to match Week 2 content */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b5a642]/10 text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-6">
              <CheckCircle size={14} /> Week 2 Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Personalised Nudges</h1>
            <p className="text-[#c9ccbb]/60 text-xl italic leading-relaxed">
              Targeted interventions based on your physiological profile.
            </p>
          </header>

          <div className="grid gap-12 mb-20">
            {/* 1. Morning Alignment */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Lightbulb size={28} />
                </div>
                <h3 className="text-2xl font-serif">Circadian Phase Shift</h3>
              </div>
              <ul className="space-y-8">
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Delayed Cortisol Anchor</span>
                  <p className="text-lg leading-relaxed opacity-80">If you feel slow or "foggy" in the morning, your biological clock is running late. Get natural light into your eyes within 30 minutes of waking for the next 5 days. Step outside for at least 10 minutes to reset your master clock.</p>
                </li>
                {/* 🟢 REMOVED DUPLICATE CONTENT FROM THIS SECTION */}
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Midday Maintenance</span>
                  <p className="text-lg leading-relaxed opacity-80">To prevent the afternoon "slump," ensure your workspace light intensity stays above 500 Lux between 11:00 and 14:00. This maintains high-order decision-making capacity throughout the day.</p>
                </li>
              </ul>
            </div>

            {/* 2. Evening Downshift */}
            <div className="glass-panel p-10 rounded-[2rem] border border-[#b5a642]/20 bg-[#b5a642]/5 shadow-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-[#b5a642] text-[#1b270e] rounded-full flex items-center justify-center">
                  <Clock size={28} />
                </div>
                <h3 className="text-2xl font-serif">Autonomic Load Management</h3>
              </div>
              <ul className="space-y-8">
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Vigilance Suppression</span>
                  <p className="text-lg leading-relaxed opacity-80">If you feel wired in the evening, your nervous system is stuck in a state of high vigilance. Start your light taper 3 hours before bed. Keep Melanopic EDI below 10 lux to allow melatonin to rise naturally.</p>
                </li>
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">Restorative Sanctuary</span>
                  <p className="text-lg leading-relaxed opacity-80">Your sleep environment must be a "Zero-Lux" zone. Detectable light in the bedroom forces the brain to remain in low-level monitoring mode, preventing the detoxification processes required for cognitive clarity tomorrow.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Transition to Week 3 */}
          <div className="flex flex-col items-center border-t border-[#c9ccbb]/10 pt-20">
            <h4 className="text-[#c9ccbb] font-serif text-3xl mb-10">Ready for Week 3?</h4>
            <Link 
              href="/coaching/sensory-lighting-dynamics/week-3" 
              className="group flex items-center gap-4 px-14 py-6 bg-[#c9ccbb] text-[#1b270e] font-bold rounded-full hover:bg-[#b5a642] transition-all shadow-2xl shadow-[#b5a642]/20"
            >
              Continue to Week 3: Designing for Regulation <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
