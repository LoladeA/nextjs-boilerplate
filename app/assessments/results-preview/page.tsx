'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowRight, Zap } from 'lucide-react'
import { getGuestData } from '../../utils/guest-storage'
import { calculateNeuroLoad } from '../../utils/scoring-engine'
import HumanScorecard from '../../components/HumanScorecard'
// 👇 CORRECTED IMPORT PATH: Points to your existing file
import PriorityList from '../report/PriorityList' 

export default function ResultsPreview() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Load Data
    const guestData = getGuestData()
    if (!guestData || Object.keys(guestData.answers).length === 0) {
      router.push('/assessments/step0')
      return
    }

    // 2. Format & Calculate
    const formattedResponses = Object.entries(guestData.answers).map(([key, value]) => ({
      question_key: key,
      answer: { response: value }
    }))
    const result = calculateNeuroLoad(formattedResponses)
    setData(result)
    setLoading(false)
  }, [router])

  if (loading) return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center text-[#b5a642]">
      <Zap className="animate-pulse mb-4" size={48} />
      <span className="font-serif text-xl">Analysing Sensory Profile...</span>
    </div>
  )

  const { totalLoad, systemState, indices, criticalIssues } = data

  // 👇 ADAPTER LOGIC: 
  // We convert the scores into the ID format your PriorityList component expects (ali, cii, etc)
  // We prioritize the highest loads.
  const priorityIDs = [
    { id: 'cii', score: indices.cii, threshold: 15 }, // Circadian
    { id: 'ali', score: indices.ali, threshold: 15 }, // Autonomic
    { id: 'pli', score: indices.pli, threshold: 15 }, // Predictive
    { id: 'stl', score: indices.stl, threshold: 15 }, // Sensory
    { id: 'rci', score: indices.rci, threshold: 15 }  // Recovery
  ]
  .filter(item => item.score > item.threshold) // Only high loads
  .sort((a, b) => b.score - a.score) // Highest first
  .slice(0, 3) // Take top 3
  .map(item => ({ id: item.id })) // Format for component: [{id: 'cii'}, {id: 'ali'}]

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans text-[#c9ccbb] pb-32">
      
      {/* HEADER */}
      <div className="p-6 md:p-12 border-b border-[#c9ccbb]/10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#b5a642] rounded-full" /> 
               <span className="font-serif text-xl tracking-wide">TheSentientHome</span>
            </div>
            <Link href="/login" className="text-xs uppercase tracking-widest text-[#c9ccbb]/40 hover:text-[#b5a642]">
                Member Login
            </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        
        <div className="mb-4">
             <h1 className="text-3xl md:text-4xl font-serif text-[#c9ccbb] mb-2">Your NeuroLoad Overview</h1>
             <p className="text-[#c9ccbb]/60">How your home environment is currently interacting with your nervous system.</p>
        </div>

        {/* --- SCORE CARD (Unlocked) --- */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
             <div className="relative z-10">
               <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">Current Nervous System State</span>
               <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">{systemState}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                 <div>
                   <div className="text-4xl font-bold text-[#c9ccbb]">{totalLoad}<span className="text-base text-[#c9ccbb]/60 font-normal">/120</span></div>
                   <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">NeuroLoad Score™</div>
                 </div>
                 <div>
                   <div className="text-4xl font-bold text-[#c9ccbb]">{priorityIDs.length}</div>
                   <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">Areas Needing Support</div>
                 </div>
                 <div>
                    <div className="text-4xl font-bold text-[#c9ccbb]">{indices.rci <= 15 ? 'Active' : 'Blocked'}</div>
                    <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">Recovery Status</div>
                 </div>
               </div>
             </div>
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
        </div>

        {/* --- PRIORITY ACTIONS (Unlocked) --- */}
        <div className="mb-16">
            <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Your Priority Actions</h3>
            {/* Using your existing PriorityList with the adapted ID list */}
            <PriorityList areas={priorityIDs.length > 0 ? priorityIDs : [{id: 'ali'}]} /> 
        </div>

        {/* --- DETAILED ANALYSIS (LOCKED) --- */}
        <div className="relative">
            <div className="flex justify-between items-end mb-8">
                <h3 className="text-2xl font-serif text-[#c9ccbb]">Detailed Analysis</h3>
                <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest">
                    <Lock size={14} /> Locked for Guests
                </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden">
                <div className="filter blur-md opacity-40 pointer-events-none select-none">
                    <HumanScorecard scores={{
                        circadian: 45,
                        autonomic: 30,
                        legibility: 60,
                        sensory: 75
                    }} />
                </div>

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-[#1b270e] via-[#1b270e]/80 to-transparent">
                    <div className="max-w-md p-8 rounded-2xl bg-[#1b270e]/90 border border-[#b5a642]/30 shadow-2xl backdrop-blur-xl">
                        <div className="w-12 h-12 rounded-full bg-[#b5a642]/20 text-[#b5a642] flex items-center justify-center mb-4 mx-auto border border-[#b5a642]/30">
                            <Lock size={20} />
                        </div>
                        
                        <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">See Your Full Diagnosis</h3>
                        <p className="text-sm text-[#c9ccbb]/70 mb-8 leading-relaxed">
                            Create a free account to unlock your detailed sensory breakdown and save your progress.
                        </p>

                        <Link 
                            href="/signup?redirect=dashboard" 
                            className="flex items-center justify-center gap-3 w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all shadow-lg shadow-[#b5a642]/20"
                        >
                            Create Free Account <ArrowRight size={18} />
                        </Link>
                        <p className="text-[10px] text-[#c9ccbb]/40 mt-4 uppercase tracking-widest">
                            Already have an account? <Link href="/login" className="text-[#b5a642] hover:underline">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* STICKY FOOTER */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1b270e] border-t border-[#b5a642]/20 p-4 z-50">
          <Link href="/signup?redirect=dashboard" className="w-full py-3 bg-[#b5a642] text-[#1b270e] font-bold rounded-lg hover:bg-[#d4c55e] transition-all text-center flex items-center justify-center gap-2">
             Save Results & Unlock
          </Link>
      </div>

    </div>
  )
}
