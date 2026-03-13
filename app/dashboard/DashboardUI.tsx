'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, RefreshCw, Brain, Activity, AlertTriangle, Fingerprint, TrendingDown, TrendingUp, Minus } from 'lucide-react'

import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import DashboardPulse from '../components/DashboardPulse'
import RitualsInterface from '../components/RitualsInterface'
import HowItWorksModal from '../components/HowItWorksModal'
import Sidebar from '../components/Sidebar'
import UpdateNudgeBanner from '../components/UpdateNudgeBanner'
import EmptyStateBanner from '../components/EmptyStateBanner'
import type { NudgeConfig } from '../components/UpdateNudgeBanner'

export default function DashboardUI({ 
  user, 
  displayName, 
  recentLogs, 
  totalLoad,
  systemState,
  radarData = [], 
  circadianLoad,
  profile = 'anchor',
  hasAssessment = true,
  nudge,
  loadDelta,
  integrationPattern,
  integrationIndex
}: any) {
  
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const [greeting, setGreeting] = useState('Welcome back')
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

  // Integration pattern — readable label for display
  const integrationLabels: Record<string, string> = {
    integrative:  'Integrative Pattern',
    mixed:        'Variable Pattern',
    accumulative: 'Accumulative Pattern'
  }
  const integrationLabel = integrationPattern
    ? integrationLabels[integrationPattern] ?? integrationPattern
    : null

  const recoveryRaw  = radarData?.find((d: any) => d.subject === 'Recovery')?.A  ?? null
  const sensoryRaw   = radarData?.find((d: any) => d.subject === 'Sensory')?.A   ?? null
  const autonomicRaw = radarData?.find((d: any) => d.subject === 'Autonomic')?.A ?? null

  const recoveryCapacity = recoveryRaw !== null ? 100 - recoveryRaw : null
  const recoveryLabel = recoveryCapacity === null ? '—'
    : recoveryCapacity > 60 ? 'High'
    : recoveryCapacity < 30 ? 'Low'
    : 'Moderate'

  const sensoryLabel = sensoryRaw === null ? '—'
    : sensoryRaw > 60 ? 'High'
    : sensoryRaw < 40 ? 'Low'
    : 'Moderate'

  const hasDelta      = loadDelta !== null && loadDelta !== undefined
  const deltaImproved = hasDelta && loadDelta < 0
  const deltaWorsened = hasDelta && loadDelta > 0
  const deltaStable   = hasDelta && loadDelta === 0

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
          {hasAssessment && (
            <div className="flex gap-4">
              <Link
                href="/assessments/report"
                className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all"
              >
                <FileText size={16} className="text-[#b5a642]" />
                View Detailed Report
              </Link>
            </div>
          )}
        </div>

        {!hasAssessment && <EmptyStateBanner />}
        {hasAssessment && nudge && <UpdateNudgeBanner nudge={nudge} />}

        {/* ROW 1: CORE METRICS */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8 scrollbar-hide">

          {/* NeuroLoad */}
          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">NeuroLoad</h3>
              <Brain className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              {hasAssessment ? (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{totalLoad}</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">Cumulative Strain</div>
                  {hasDelta && (
                    <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-widest
                      ${deltaImproved ? 'text-[#b5a642]' : deltaWorsened ? 'text-[#b5a642]' : 'text-[#c9ccbb]'}`}>
                      {deltaImproved && <TrendingDown size={11} />}
                      {deltaWorsened && <TrendingUp size={11} />}
                      {deltaStable   && <Minus size={11} />}
                      {deltaImproved && `↓ ${Math.abs(loadDelta)} pts since baseline`}
                      {deltaWorsened && `↑ ${Math.abs(loadDelta)} pts since baseline`}
                      {deltaStable   && 'Stable since baseline'}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb]/70 mb-1">—</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">Assessment needed</div>
                </>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Recovery Capacity */}
          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Recovery Capacity</h3>
              <Activity className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              {hasAssessment ? (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb] mb-1">{recoveryCapacity}%</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">{recoveryLabel} Potential</div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb]/60 mb-1">—</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">Assessment needed</div>
                </>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Sensory Load */}
          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Load</h3>
              <AlertTriangle className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              {hasAssessment ? (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb] mb-1 capitalize">{sensoryLabel}</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">Current Stress Load</div>
                </>
              ) : (
                <>
                  <div className="text-5xl font-serif text-[#c9ccbb]/60 mb-1">—</div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">Assessment needed</div>
                </>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* ─── SENSORY PROFILE CARD ──────────────────────────────────────
              Now surfaces both axes:
              - Threshold archetype  "The Sensor"           (large serif)
              - Integration pattern  "Variable Pattern"     (gold badge)
              - Profile descriptor   short plain-language   (muted fine text)
              The descriptor is truncated to one line — full text lives in
              the SensoryModal which the report page orbital badge opens.
          ────────────────────────────────────────────────────────────────── */}
          <div className="snap-center shrink-0 w-[85vw] md:w-auto glass-panel p-6 rounded-3xl border border-[#c9ccbb]/10 flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
            <div className="flex justify-between items-start z-10 relative">
              <h3 className="text-[#c9ccbb] font-serif text-xl">Sensory Profile</h3>
              <Fingerprint className="text-[#b5a642]" size={20} />
            </div>
            <div className="z-10 relative">
              {hasAssessment ? (
                <>
                  <div className="text-4xl font-serif text-[#c9ccbb] mb-2">The {identityLabel}</div>

                  {/* Integration pattern badge — only renders when data present */}
                  {integrationLabel && (
                    <div className="inline-flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-full border border-[#b5a642]/30 bg-[#b5a642]/8">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#b5a642]">
                        {integrationLabel}
                      </span>
                    </div>
                  )}

                  <Link
                    href="/assessment/update"
                    className="inline-flex items-center gap-2 text-[10px] text-[#b5a642] uppercase tracking-widest hover:text-[#b5a642]/80 transition-colors border border-[#b5a642]/20 px-3 py-1.5 rounded-full hover:bg-[#b5a642]/10"
                  >
                    <RefreshCw size={10} /> Update Baseline
                  </Link>
                </>
              ) : (
                <>
                  <div className="text-4xl font-serif text-[#c9ccbb]/80 mb-2">—</div>
                  <Link
                    href="/assessments/step0"
                    className="inline-flex items-center gap-2 text-[10px] text-[#b5a642] uppercase tracking-widest hover:text-[#b5a642]/80 transition-colors border border-[#b5a642]/20 px-3 py-1.5 rounded-full hover:bg-[#b5a642]/10"
                  >
                    Begin Assessment
                  </Link>
                </>
              )}
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
                  <div className="text-2xl font-serif text-[#c9ccbb]">
                    {recentLogs[0].mood_score}<span className="text-sm text-[#c9ccbb]/60">/5</span>
                  </div>
                  <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">Latest Log</div>
                </div>
              )}
            </div>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="absolute bottom-0 left-0 right-0 h-48 opacity-80 pointer-events-none">
                <DashboardPulse logs={recentLogs} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center pb-6">
                <p className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest">
                  Daily logs will appear here
                </p>
              </div>
            )}
          </div>

          {/* Current Baseline card */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden border-l-4 border-[#b5a642] min-h-[250px]">
            <div className="relative z-10">
              <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">
                Current Baseline
              </div>
              {hasAssessment ? (
                <>
                  <div className="text-6xl font-serif text-[#c9ccbb] mb-2">{totalLoad}</div>
                  <div className="text-lg text-[#c9ccbb]/80 mb-4">{systemState}</div>
                  <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">NeuroLoad Score™</div>
                  {hasDelta && (
                    <div className={`mt-4 text-[10px] font-bold uppercase tracking-widest
                      ${deltaImproved ? 'text-[#b5a642]' : deltaWorsened ? 'text-[#b5a642]' : 'text-[#c9ccbb]'}`}>
                      {deltaImproved && `↓ ${Math.abs(loadDelta)} pts from original`}
                      {deltaWorsened && `↑ ${Math.abs(loadDelta)} pts from original`}
                      {deltaStable   && 'No change from original'}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-6xl font-serif text-[#c9ccbb]/60 mb-2">—</div>
                  <div className="text-sm text-[#c9ccbb]/70 mb-4">Not yet established</div>
                  <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">NeuroLoad Score™</div>
                </>
              )}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#b5a642]/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* ROW 3: SENSORY PROFILE + NEURO INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 lg:items-stretch">
          <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden border border-[#c9ccbb]/10 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Your Sensory Profile</h3>
                <p className="text-sm text-[#c9ccbb]/80">Five domains · Lower score = lower friction</p>
              </div>
            </div>
            {hasAssessment && radarData.length > 0 ? (
              <div className="flex-1 min-h-[320px] md:min-h-[380px] w-full">
                <SensoryRadar data={radarData} />
              </div>
            ) : (
              <div className="flex-1 min-h-[320px] w-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[#c9ccbb]/60 text-6xl font-serif mb-3">◎</div>
                  <p className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest">
                    Complete your assessment to see your radar
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-full min-h-[400px]">
            <NeuroFlashcard
              isPremium={hasAccess}
              scores={{
                light:    circadianLoad > 15 ? 40 : 80,
                visual:   sensoryRaw !== null ? 100 - sensoryRaw : 50,
                acoustic: autonomicRaw !== null ? 100 - autonomicRaw : 50
              }}
            />
          </div>
        </div>

        {/* ROW 4: PROTOCOLS */}
        <div className="mb-8">
          <RitualsInterface
            neuroLoadScore={totalLoad ?? 0}
            profile={profile}
            integrationPattern={integrationPattern ?? 'integrative'}
          />
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
