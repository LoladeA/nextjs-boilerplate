'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, RefreshCw, Brain, Activity, AlertTriangle, Fingerprint } from 'lucide-react'

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
  radarData = [], 
  circadianLoad,
  profile = 'anchor'
}: any) {
  
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')

  // ---------------------------------------------------------------------------
  // ACCESS CONTROL
  //
  // Neuro Insights (NeuroFlashcard) is a Core feature.
  // Any paying subscriber — Core or Blueprint — sees it.
  // hasAccess: tier !== null (Core or Blueprint) or god mode email.
  // ---------------------------------------------------------------------------
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    const hasSeen = localStorage.getItem('hasSeenGuide')
    if (!hasSeen) {
      setIsGuideOpen(true)
      localStorage.setItem('hasSeenGuide', 'true')
    }

    // Check subscription tier — Neuro Insights unlocks at Core and above
    const checkAccess = async () => {
      try {
        // God mode shortcut — check against the user prop passed from server
        if (user?.email === 'christchilde@gmail.com') {
          setHasAccess(true)
          return
        }
        const res = await fetch('/api/subscription-status')
        if (res.ok) {
          const data = await res.json()
          // Core or Blueprint both unlock Neuro Insights
          setHasAccess(data.tier === 'core' || data.tier === 'blueprint')
        }
      } catch {
        setHasAccess(false)
      }
    }
    checkAccess()
  }, [user])

  // Identity Translation Map
  const profileLabels: Record<string, string> = {
    anchor: 'Anchor',
    seeker: 'Seeker',
    sensor: 'Sensor'
  }
  const identityLabel = profileLabels[profile] || 'Anchor'
  
  // Data extraction
  const recoveryRaw  = radarData?.find((d: any) => d.subject === 'Recovery')?.A  || 50
  const sensoryRaw   = radarData?.find((d: any) => d.subject === 'Sensory')?.A   || 50
  const autonomicRaw = radarData?.find((d: any) => d.subject === 'Autonomic')?.A || 50

  const recoveryCapacity = 100 - recoveryRaw
  let recoveryLabel = 'Moderate'
  if (recoveryCapacity > 60) recoveryLabel = 'High'
  else if (recoveryCapacity < 30) recoveryLabel = 'Low'

  let sensoryLabel = 'Moderate'
  if (sensoryRaw > 60) sensoryLabel = 'High'
  else if (sensoryRaw < 40) sensoryLabel = 'Low'

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      <Sidebar onOpenGuide={() => setIsGuideOpen(true)} />
      <HowItWorksModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12">
                <Image src="/logo.PNG" alt="Logo" fill className="object-contain" priority />
              </div>
              <h1 className="font-serif text-2xl text-[#c9ccbb] tracking-wide">
                The Sentient <span className="text-[#b5a642]">Home</span>
              </h1>
            </div>
            <p className="text-[#c9ccbb]/80 font-light capitalize text-lg">
              {greeting}, <span className="text-[#c9ccbb] font-normal">{displayName}</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
              <FileText size={16} className="text-[#b5a642]" />
              View Detailed Report
            </Link>
          </div>
        </div>

        {/* ROW 1: CORE METRICS */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8 scrollbar-hide">
          
          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">NeuroLoad</h3>
              <Brain className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{totalLoad}</div>
              <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Cumulative Strain</div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Recovery Capacity</h3>
              <Activity className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{recoveryCapacity}%</div>
              <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">{recoveryLabel} Potential</div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Load</h3>
              <AlertTriangle className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              <div className="text-5xl font-serif text-[#c9ccbb] mb-1 capitalize">{sensoryLabel}</div>
              <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Current Stress Load</div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Profile</h3>
              <Fingerprint className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              <div className="text-4xl font-serif text-[#c9ccbb] mb-2">The {identityLabel}</div>
              <Link href="/assessments/step0" className="inline-flex items-center gap-2 text-[10px] text-[#b5a642] uppercase tracking-widest hover:text-[#b5a642]/80 transition-colors border border-[#b5a642]/20 px-3 py-1.5 rounded-full hover:bg-[#b5a642]/10">
                <RefreshCw size={10} /> Update Baseline
              </Link>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>

        {/* ROW 2: RHYTHM & BASELINE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[250px] border border-[#c9ccbb]/10">
            <div className="relative z-10 flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#c9ccbb] font-serif text-xl">Nervous System Rhythm</h3>
                <p className="text-[#c9ccbb]/80 text-xs uppercase tracking-widest mt-1">14-Day Rhythm</p>
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

        {/* ROW 3: SENSORY PROFILE + NEURO INSIGHTS */}
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

          {/* ----------------------------------------------------------------
              NEURO INSIGHTS — Core feature
              isPremium now reflects the live subscription-status API check.
              Free users see the locked state inside NeuroFlashcard.
              Core and Blueprint subscribers see full insights.
          ---------------------------------------------------------------- */}
          <div className="h-full min-h-[400px]">
            <NeuroFlashcard 
              isPremium={hasAccess}
              scores={{
                light:    circadianLoad > 15 ? 40 : 80,
                visual:   100 - sensoryRaw,
                acoustic: 100 - autonomicRaw
              }}
            />
          </div>
        </div>

        {/* ROW 4: PROTOCOLS */}
        <div className="mb-8">
          <RitualsInterface neuroLoadScore={totalLoad} profile={profile} />
        </div>

        {/* ROW 5: TOOLKIT */}
        <div className="mb-8">
          <h3 className="text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-6">Toolkit</h3>
          <SensoryTools />
        </div>
      
      </div>
    </div>
  )
}
