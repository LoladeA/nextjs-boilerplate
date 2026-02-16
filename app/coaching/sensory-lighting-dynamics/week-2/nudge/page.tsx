'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { ArrowRight, Lightbulb, CheckCircle, Clock } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'

export default function Week2Nudge() {
  const supabase = createClientComponentClient()

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <main className="md:ml-64 min-h-screen p-6 md:p-12 lg:p-20">
        <div className="max-w-4xl mx-auto text-[#c9ccbb]">
          
          <header className="mb-20">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">Week 2: Personalised Nudges</h1>
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
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">When Your Body Clock Is Running Late</span>
                  <p className="text-lg leading-relaxed opacity-80">If you feel slow in the morning, get natural light into your eyes within 30 minutes of waking for the next 5 days. Step outside if possible. Track how clear your head feels before noon.</p>
                </li>
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">When Your Nervous System Is Staying on Guard</span>
                  <p className="text-lg leading-relaxed opacity-80">If you feel wired in the evening or easily irritated, your nervous system is working harder than necessary. Begin lowering lighting levels 2–3 hours before sleep. Shift to warm, low-level lamps only and turn down the light intensity in your main living area.</p>
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
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">When Low Daylight Leaves You Foggy</span>
                  <p className="text-lg leading-relaxed opacity-80">If midday feels flat or mentally heavy, your daytime light exposure may be too low. Increase brightness in your primary workspace before midday. If possible, work near a window or take a 10-minute outdoor break.</p>
                </li>
                <li className="bg-[#1b270e]/40 p-8 rounded-2xl border border-[#c9ccbb]/10">
                  <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest block mb-4">When Your Nervous System Is Staying on Guard</span>
                  <p className="text-lg leading-relaxed opacity-80">If uou feel wired in the evening or easily irritated, your nervous system is working harder than necessary. Begin lowering your indoor lighting levels 2–3 hours before sleep. Shift to warm, low-level lamps only. Reduce the light intensity in your main living area.</p>
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
