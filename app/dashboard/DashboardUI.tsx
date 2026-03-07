'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, RefreshCw, Brain, Activity, AlertTriangle, Fingerprint, TrendingDown, TrendingUp, Minus, Sparkles, Lock } from 'lucide-react'

import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import DashboardPulse from '../components/DashboardPulse'
import RitualsInterface from '../components/RitualsInterface'
import HowItWorksModal from '../components/HowItWorksModal'
import Sidebar from '../components/Sidebar'
import UpdateNudgeBanner from '../components/UpdateNudgeBanner'

export default function DashboardUI({ 
  user, 
  displayName, 
  recentLogs, 
  totalLoad = 0, // Default to 0 for new users
  systemState = "Awaiting Baseline", 
  radarData = [], 
  circadianLoad,
  profile = 'anchor',
  nudge,
  loadDelta
}: any) {
  
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')
  const [hasAccess, setHasAccess] = useState(false)

  // Determine if this is a "Zero State" (New User)
  const isNewUser = totalLoad === 0 || !radarData || radarData.length === 0;

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

    const checkAccess = async () => {
      try {
        if (user?.email === 'christchilde@gmail.com') {
          setHasAccess(true)
          return
        }
        const res = await fetch('/api/subscription-status')
        if (res.ok) {
          const data = await res.json()
          setHasAccess(data.tier === 'core' || data.tier === 'blueprint')
        }
      } catch {
        setHasAccess(false)
      }
    }
    checkAccess()
  }, [user])

  const profileLabels: Record<string, string> = {
    anchor: 'Anchor',
    seeker: 'Seeker',
    sensor: 'Sensor'
  }
  const identityLabel = profileLabels[profile] || 'Anchor'
  
  const recoveryRaw  = radarData?.find((d: any) => d.subject === 'Recovery')?.A  || 0
  const sensoryRaw   = radarData?.find((d: any) => d.subject === 'Sensory')?.A   || 0
  const autonomicRaw = radarData?.find((d: any) => d.subject === 'Autonomic')?.A || 0

  const recoveryCapacity = 100 - recoveryRaw
  const hasDelta = loadDelta !== null && loadDelta !== undefined

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      <Sidebar onOpenGuide={() => setIsGuideOpen(true)} />
      <HowItWorksModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <div className="md:ml-64 min-h-screen p-6 md:p-12 relative">
        
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
          
          <div className="flex items-center gap-6">
            <Link 
              href="/assessments/step0" 
              className="text-xs font-medium tracking-widest uppercase text-[#b5a642] hover:text-[#c9ccbb] transition-colors flex items-center gap-2"
            >
              <Sparkles size={12} />
              {isNewUser ? "Begin Foundation" : "New? Take Assessment"}
            </Link>

            <Link href="/assessments/report" className="flex items-center gap-2 px-5 py-2.5 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-xs font-medium transition-all border border-[#c9ccbb]/10">
              <FileText size={14} className="text-[#b5a642]" />
              View Detailed Report
            </Link>
          </div>
        </div>

        {nudge && <UpdateNudgeBanner nudge={nudge} />}

        {/* MAIN DASHBOARD CONTENT */}
        <div className={`transition-all duration-700 ${isNewUser ? 'blur-md pointer-events-none opacity-40 select-none' : 'opacity-100'}`}>
          {/* ROW 1: CORE METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
              <div className="flex justify-between items-start z-10 relative">
                <h3 className="text-[#c9ccbb] font-serif text-xl">NeuroLoad</h3>
                <Brain className="text-[#b5a642]" size={20} />
              </div>
              <div className="z-10 relative">
                <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{totalLoad}</div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Cumulative Strain</div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
              <div className="flex justify-between items-start z-10 relative">
                <h3 className="text-[#c9ccbb] font-serif text-xl">Recovery Capacity</h3>
                <Activity className="text-[#b5a642]" size={20} />
              </div>
              <div className="z-10 relative">
                <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{recoveryCapacity}%</div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Potential</div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
              <div className="flex justify-between items-start z-10 relative">
                <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Load</h3>
                <AlertTriangle className="text-[#b5a642]" size={20} />
              </div>
              <div className="z-10 relative">
                <div className="text-5xl font-serif text-[#c9ccbb] mb-1 capitalize">---</div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">Current Stress</div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
              <div className="flex justify-between items-start z-10 relative">
                <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Profile</h3>
                <Fingerprint className="text-[#b5a642]" size={20} />
              </div>
              <div className="z-10 relative">
                <div className="text-4xl font-serif text-[#c9ccbb] mb-2">The {identityLabel}</div>
              </div>
            </div>
          </div>

          {/* ROW 2: RHYTHM & BASELINE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 min-h-[250px]">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Nervous System Rhythm</h3>
              <DashboardPulse logs={recentLogs || []} />
            </div>
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center text-center border-l-4 border-[#b5a642] min-h-[250px]">
              <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Current Baseline</div>
              <div className="text-6xl font-serif text-[#c9ccbb] mb-2">{totalLoad}</div>
              <div className="text-lg text-[#c9ccbb]/80">{systemState}</div>
            </div>
          </div>
        </div>

        {/* ZERO STATE OVERLAY: The "Agency over Adaptation" Guardrail */}
        {isNewUser && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pt-32">
            <div className="glass-panel p-10 rounded-3xl border border-[#b5a642]/30 text-center max-w-md shadow-2xl bg-[#1b270e]/80 backdrop-blur-sm">
              <div className="w-16 h-16 bg-[#b5a642]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="text-[#b5a642]" size={32} />
              </div>
              <h2 className="font-serif text-2xl text-[#c9ccbb] mb-4">Intelligence Baseline Required</h2>
              <p className="text-[#c9ccbb]/70 text-sm mb-8 leading-relaxed">
                Your sentient environment cannot adapt without data. Complete your initial sensory assessment to unlock your profile and personalized protocols.
              </p>
              <Link 
                href="/assessments/step0" 
                className="inline-block w-full py-4 bg-[#b5a642] text-[#1b270e] rounded-xl font-bold uppercase tracking-widest hover:bg-[#c9ccbb] transition-all"
              >
                Build Your Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
