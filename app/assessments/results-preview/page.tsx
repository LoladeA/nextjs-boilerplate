'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowRight, Save, Zap } from 'lucide-react'
import { getGuestData } from '../../utils/guest-storage'
import { calculateNeuroLoad } from '../../utils/scoring-engine'
import HumanScorecard from '../../components/HumanScorecard'

export default function ResultsPreview() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Load Data from Browser
    const guestData = getGuestData()
    
    if (!guestData || Object.keys(guestData.answers).length === 0) {
      // No data found? Send them back to start.
      router.push('/assessments/step0')
      return
    }

    // 2. Format Data for Engine
    // The engine expects an array of { question_key, answer: { response } }
    const formattedResponses = Object.entries(guestData.answers).map(([key, value]) => ({
      question_key: key,
      answer: { response: value }
    }))

    // 3. Calculate Score
    const result = calculateNeuroLoad(formattedResponses)
    setData(result)
    setLoading(false)
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center text-[#b5a642]">
      <Zap className="animate-pulse mb-4" size={48} />
      <span className="font-serif text-xl">Calibrating Bio-Data...</span>
    </div>
  )

  // Extract values
  const { totalLoad, systemState, indices } = data

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans text-[#c9ccbb] pb-32">
      
      {/* HEADER */}
      <div className="p-6 md:p-12 border-b border-[#c9ccbb]/10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
                <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest">Preliminary Analysis</span>
                <h1 className="text-2xl md:text-3xl font-serif mt-2">Your NeuroLoad Profile</h1>
            </div>
            {/* Login Link for existing users */}
            <Link href="/login" className="text-xs uppercase tracking-widest text-[#c9ccbb]/80 hover:text-[#b5a642]">
                Member Login
            </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        
        {/* HERO CARD: THE SCORE */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
             <div className="relative z-10">
               <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">Current Nervous System State</span>
               <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">{systemState}</h2>
               
               <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                 <div>
                   <div className="text-4xl font-bold text-[#c9ccbb]">{totalLoad}<span className="text-base text-[#c9ccbb]/60 font-normal">/120</span></div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">NeuroLoad Score™</div>
                 </div>
                 <div>
                   <div className="text-4xl font-bold text-[#c9ccbb]">{indices.cii > 15 ? 'High' : 'Normal'}</div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">Circadian Rhythm</div>
                 </div>
               </div>
             </div>
             
             {/* Glow Effect */}
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
        </div>

        {/* DETAILED ANALYSIS (The "Hook") */}
        <div className="mb-16">
            <h3 className="text-xl font-serif text-[#c9ccbb] mb-6">Sensory Breakdown</h3>
            <HumanScorecard scores={{
                circadian: (indices.cii / 25) * 100,
                autonomic: (indices.ali / 20) * 100,
                legibility: (indices.pli / 25) * 100,
                sensory: (indices.stl / 25) * 100
            }} />
        </div>

        {/* THE LOCKED SECTION (The "Bait") */}
        <div className="relative p-8 rounded-3xl border border-[#c9ccbb]/10 bg-[#141d0b] overflow-hidden">
            
            {/* Blur Overlay & CTA */}
            <div className="absolute inset-0 backdrop-blur-md bg-[#1b270e]/80 z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#b5a642]/20 text-[#b5a642] flex items-center justify-center mb-6 border border-[#b5a642]/30">
                    <Lock size={32} />
                </div>
                <h3 className="text-3xl font-serif text-[#c9ccbb] mb-3">Unlock Your Action Plan</h3>
                <p className="text-[#c9ccbb]/70 max-w-md mb-8 leading-relaxed">
                    We have generated <strong>3 specific rituals</strong> to lower your NeuroLoad score from <strong>{totalLoad}</strong> to <strong>{Math.round(totalLoad * 0.7)}</strong>.
                </p>
                
                <Link href="/signup?redirect=dashboard" className="px-8 py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all flex items-center gap-3 shadow-lg shadow-[#b5a642]/20">
                    Create A Free Account to Save Your Progress <ArrowRight size={18} />
                </Link>
                <p className="text-[10px] text-[#c9ccbb]/80 mt-4 uppercase tracking-widest">It takes 30 seconds • No credit card required</p>
            </div>

            {/* Fake Background Content (Blurred out visually) */}
            <div className="opacity-30 filter blur-sm select-none pointer-events-none">
                <h3 className="text-xl font-serif text-[#c9ccbb] mb-6">Recommended Rituals</h3>
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5">
                        <div className="h-6 w-1/3 bg-[#c9ccbb]/20 rounded mb-4"></div>
                        <div className="h-4 w-full bg-[#c9ccbb]/10 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-[#c9ccbb]/10 rounded"></div>
                    </div>
                    <div className="p-6 rounded-2xl border border-[#c9ccbb]/10 bg-[#c9ccbb]/5">
                        <div className="h-6 w-1/3 bg-[#c9ccbb]/20 rounded mb-4"></div>
                        <div className="h-4 w-full bg-[#c9ccbb]/10 rounded mb-2"></div>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* STICKY FOOTER (The Persistent Nudge) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1b270e] border-t border-[#b5a642]/20 p-4 md:p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                  <div className="text-[#c9ccbb] font-serif text-lg">Don't lose your progress.</div>
                  <div className="text-[#c9ccbb]/80 text-xs">Save your score of <strong className="text-[#b5a642]">{totalLoad}/120</strong> to track your improvement.</div>
              </div>
              <Link href="/signup?redirect=dashboard" className="w-full md:w-auto px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold rounded-lg hover:bg-[#d4c55e] transition-all text-center flex items-center justify-center gap-2">
                  <Save size={18} /> Save Profile
              </Link>
          </div>
      </div>

    </div>
  )
}
