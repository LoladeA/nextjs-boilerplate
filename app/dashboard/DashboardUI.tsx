'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, RefreshCw, Brain, Activity, AlertTriangle, ArrowRight } from 'lucide-react'

import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import DashboardPulse from '../components/DashboardPulse'
import RitualsInterface from '../components/RitualsInterface'
import HowItWorksModal from '../components/HowItWorksModal'
import Sidebar from '../components/Sidebar'

export default function DashboardUI({ 
  user, 
  displayName, 
  recentLogs, 
  totalLoad, 
  systemState, 
  radarData = [], // Default to empty array if missing
  circadianLoad
}: any) {
  
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenGuide')
    if (!hasSeen) {
      setIsGuideOpen(true)
      localStorage.setItem('hasSeenGuide', 'true')
    }
  }, [])

  // --- CRASH FIX: SAFE CALCULATION LOGIC ---
  // We extract scores directly from radarData to avoid "undefined" errors
  
  // 1. Get Raw Scores (Default to 50 if data is missing to prevent crash)
  const recoveryRaw = radarData?.find((d: any) => d.subject === 'Recovery')?.A || 50
  const sensoryRaw = radarData?.find((d: any) => d.subject === 'Sensory')?.A || 50
  const autonomicRaw = radarData?.find((d: any) => d.subject === 'Autonomic')?.A || 50

  // 2. Calculate Display Values
  const recoveryCapacity = 100 - recoveryRaw; // Invert: Lower load = Higher capacity
  
  // 3. Generate Labels
  let recoveryLabel = 'Moderate';
  if (recoveryCapacity > 75) recoveryLabel = 'Optimal';
  else if (recoveryCapacity < 50) recoveryLabel = 'Low';

  let sensoryLabel = 'Moderate';
  if (sensoryRaw > 60) sensoryLabel = 'High';
  else if (sensoryRaw < 30) sensoryLabel = 'Low';

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      <Sidebar onOpenGuide={() => setIsGuideOpen(true)} />
      <HowItWorksModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="relative w-64 h-16 mb-2">
              <Image src="/logo.PNG" alt="TheSentientHome" fill className="object-contain object-left" priority />
            </div>
            <p className="text-[#c9ccbb]/80 font-light capitalize text-lg">
              Welcome back, <span className="text-[#c9ccbb] font-normal">{displayName}</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
              <FileText size={16} className="text-[#b5a642]" />
              View Detailed Report
            </Link>
          </div>
        </div>

        {/* --- ROW 1: CORE METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* 1. Nervous System State */}
            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                    <h3 className="text-[#c9ccbb] font-serif text-xl">NeuroLoad</h3>
                    <Brain className="text-[#b5a642]" size={24} />
                </div>
                <div className="z-10 relative">
                    <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{totalLoad}</div>
                    <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Cumulative Strain</div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* 2. Recovery Capacity */}
            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                    <h3 className="text-[#c9ccbb] font-serif text-xl">Recovery Capacity</h3>
                    <Activity className="text-[#b5a642]" size={24} />
                </div>
                <div className="z-10 relative">
                    <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{recoveryCapacity}%</div>
                    <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">{recoveryLabel} Potential</div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* 3. Sensory Load */}
            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                    <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Load</h3>
                    <AlertTriangle className="text-[#b5a642]" size={24} />
                </div>
                <div className="z-10 relative">
                    <div className="text-5xl font-serif text-[#c9ccbb] mb-1 capitalize">{sensoryLabel}</div>
                    <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Current Stress Load</div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* 4. Retake Assessment */}
            <Link href="/assessments/step0" className="group glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 hover:bg-[#c9ccbb]/5 transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                    <h3 className="text-[#c9ccbb] font-serif text-xl">Retake Assessment</h3>
                    <RefreshCw className="text-[#b5a642] group-hover:rotate-180 transition-transform duration-500" size={24} />
                </div>
                <div className="z-10 relative">
                    <div className="flex items-center gap-2 text-[#b5a642] font-bold">
                        Track Your Progress <ArrowRight size={18} />
                    </div>
                    <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">Update Your Baseline</div>
                </div>
            </Link>
        </div>

        {/* --- ROW 2: RHYTHM & BASELINE --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[250px] border border-[#c9ccbb]/10">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-[#c9ccbb] font-serif text-xl">Nervous System Rhythm</h3>
                        <p className="text-[#c9ccbb]/80 text-xs uppercase tracking-widest mt-1">Last 14 Days Trend</p>
                    </div>
                    {recentLogs && recentLogs.length > 0 && (
                         <div className="text-right">
                             <div className="text-2xl font-serif text-[#c9ccbb]">{recentLogs[0].mood_score}<span className="text-sm text-[#c9ccbb]/40">/5</span></div>
                             <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">Latest Log</div>
                         </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-48 opacity-80 pointer-events-none">
                    <DashboardPulse logs={recentLogs || []} />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden border-l-4 border-[#b5a642] min-h-[250px]">
                <div className="relative z-10">
                    <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Current Baseline</div>
                    <div className="text-6xl font-serif text-[#c9ccbb] mb-2">{totalLoad}</div>
                    <div className="text-lg text-[#c9ccbb]/80 mb-4">{systemState}</div>
                    <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">NeuroLoad Score™</div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#b5a642]/10 rounded-full blur-3xl" />
            </div>
        </div>

        {/* --- ROW 3: SENSORY PROFILE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden border border-[#c9ccbb]/10 min-h-[400px]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Your Sensory Profile</h3>
                <p className="text-sm text-[#c9ccbb]/80">Circadian • Autonomic • Predictive • Sensory • Recovery</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <SensoryRadar data={radarData || []} />
            </div>
          </div>

          <div className="h-full min-h-[400px]">
            <NeuroFlashcard 
              isPremium={false} 
              scores={{
                light: circadianLoad > 15 ? 40 : 80,
                visual: sensoryRaw, 
                acoustic: autonomicRaw
              }}
            />
          </div>
        </div>

        {/* --- ROW 4: PROTOCOLS --- */}
        <div className="mb-8">
             <RitualsInterface neuroLoadScore={totalLoad} />
        </div>

        {/* --- ROW 5: TOOLKIT --- */}
        <div className="mb-8">
            <h3 className="text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-6">Toolkit</h3>
            <SensoryTools />
        </div>
      
      </div>
    </div>
  )
}
