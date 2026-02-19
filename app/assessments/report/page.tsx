import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Activity, Brain, ShieldAlert, Zap, CheckCircle } from 'lucide-react'

// 🟢 ENGINE TYPES
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'

// 🟢 MAPPING LOGIC
import { mapEngineToDashboard } from '@/app/lib/neuro-mapper'

// 🟢 COMPONENT IMPORTS
import DownloadButton from './DownloadButton'
import OrbitalBadge from '../../components/OrbitalBadge'
import Sidebar from '../../components/Sidebar'
import PriorityList from './PriorityList'
import HumanScorecard from '../../components/HumanScorecard'

export const dynamic = 'force-dynamic'

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // 🟢 1. FETCH FROM SECURE VIEW
  const { data: responses } = await supabase
    .from('current_user_responses')
    .select('*')
    .eq('user_id', session?.user.id)

  const safeResponses = responses || []

  // =========================================================
  // 2. EXTRACT IDENTITY
  // =========================================================
  
  const neuroLensAnswer = 
    safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value || 
    'None'

  // =========================================================
  // 3. RUN CALCULATION
  // =========================================================

  // 🟢 THE PLG SHIELD: Prevent server crash if data hasn't synced yet
  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center font-sans">
        <Activity className="text-[#b5a642] animate-pulse mb-6" size={48} />
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-3">Calibrating Report...</h1>
        <p className="text-[#c9ccbb]/70 text-sm max-w-md mx-auto mb-8">
          Your sensory data is currently synchronising. Please return to the dashboard to complete the baseline calibration.
        </p>
        <Link href="/dashboard">
           <button className="px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all">
              Return to Dashboard
           </button>
        </Link>
      </div>
    )
  }

  const engineInput = safeResponses.map((r: any) => ({
    question_key: r.question_key,
    answer: { response: r.answer_value }
  }))

  const engineResult = calculateNeuroLoad(engineInput, neuroLensAnswer)
  
  const { 
    rawIndices, 
    percentIndices, 
    finalNeuroLoad, 
    systemState, 
    priorityDomains, 
    recoveryModifier, 
    sensoryProfile 
  } = engineResult

  // 🟢 4. MAP TO DASHBOARD IDENTITY
  const profile = mapEngineToDashboard(sensoryProfile)

  // =========================================================
  // 5. CONFIGURE UI DOMAINS
  // =========================================================

  const domains = [
    {
      id: 'cii',
      name: 'Circadian Rhythm',
      score: rawIndices.cii,
      max: 25,
      description: profile === 'seeker' 
        ? 'Capacity to maintain wakefulness without caffeine spikes.' 
        : 'Alignment with biological day/night rhythm.',
      status: percentIndices.cii <= 40 ? 'Regulated' : percentIndices.cii <= 65 ? 'Drifting' : 'Dysregulated',
      icon: <Zap size={24} className={percentIndices.cii > 65 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'ali',
      name: 'Autonomic Load',
      score: rawIndices.ali,
      max: 25, 
      description: profile === 'sensor'
        ? 'Background vigilance caused by sensory friction.' 
        : 'Nervous system activation and stress axis load.',
      status: percentIndices.ali <= 40 ? 'Stable' : percentIndices.ali <= 65 ? 'Activated' : 'High Vigilance',
      icon: <Activity size={24} className={percentIndices.ali > 65 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'pli',
      name: 'Predictive Legibility',
      score: rawIndices.pli,
      max: 25,
      description: profile === 'seeker'
        ? 'Are your visual cues working or disappearing?' 
        : 'Spatial clarity and cognitive friction.',
      status: percentIndices.pli <= 40 ? 'Legible' : percentIndices.pli <= 65 ? 'Frictional' : 'Fragmented',
      icon: <Brain size={24} className={percentIndices.pli > 65 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'stl',
      name: 'Sensory Load',
      score: rawIndices.stl,
      max: 35, 
      description: profile === 'sensor'
        ? 'Pain-point triggers: Glare, Echo, Texture.' 
        : profile === 'seeker' 
          ? 'Under-stimulation vs. Distraction balance.' 
          : 'Cumulative impact of noise, clutter, and texture.',
      status: percentIndices.stl <= 40 ? 'Optimized' : percentIndices.stl <= 65 ? 'Moderate' : 'Overload',
      icon: <ShieldAlert size={24} className={percentIndices.stl > 65 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'rci',
      name: 'Recovery Potential',
      score: rawIndices.rci,
      max: 35, 
      description: profile === 'seeker'
        ? 'Ability of the home to provide active regulation (movement).' 
        : 'Capacity of the home to support parasympathetic restoration (calm).',
      status: percentIndices.rci <= 40 ? 'Strong' : percentIndices.rci <= 65 ? 'Moderate' : 'Compromised',
      icon: <CheckCircle size={24} className={percentIndices.rci > 65 ? "text-red-400" : "text-[#b5a642]"} />
    }
  ]

  // =========================================================
  // 6. CRITICAL ISSUES
  // =========================================================

  const criticalIssues = priorityDomains
    .map(p => domains.find(d => d.id === p.id))
    .filter(Boolean) as typeof domains

  // =========================================================
  // 7. RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors w-fit">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">

          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            
            {/* LEFT: TITLE */}
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">
                Your NeuroLoad Overview
              </h1>
              <p className="text-[#c9ccbb]/70">
                How your home interacts with your <strong>{neuroLensAnswer}</strong> sensory profile.
              </p>
            </div>
            
            {/* RIGHT: BADGE & BUTTON (SIDE BY SIDE) */}
            {/* 🟢 LAYOUT FIX: 'flex-row' makes them sit next to each other */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                
                {/* 1. ORBITAL BADGE (The Glowing Trigger) */}
                <OrbitalBadge profile={profile} />

                {/* 2. PDF DOWNLOAD BUTTON */}
                <DownloadButton 
                  data={{
                    displayName: session?.user.user_metadata?.full_name || 'Resident',
                    score: finalNeuroLoad,
                    systemState: systemState,
                    profile: profile,
                    domains: domains
                  }}
                />

            </div>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">
                  Current System State
                </span>
                <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">
                  {systemState}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                  <div>
                    <div className="text-3xl font-bold text-[#c9ccbb]">
                      {finalNeuroLoad}
                      <span className="text-base text-[#c9ccbb]/80 font-normal">/100</span>
                    </div>
                    <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                      NeuroLoad Score™
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#c9ccbb]">
                      {criticalIssues.length}
                    </div>
                    <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                      Priority Areas
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#c9ccbb] capitalize">
                      {recoveryModifier}
                    </div>
                    <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                      Recovery Modifier
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* PRIORITY FOCUS AREAS */}
          {criticalIssues.length > 0 && (
             <div className="mb-16">
               <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">
                 Your Priority Actions
               </h3>
               <PriorityList areas={criticalIssues} profile={profile} />
             </div>
          )}

          {/* DETAILED ANALYSIS */}
          <div className="mb-16">
             <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">
               Detailed Analysis
             </h3>
             <HumanScorecard 
               scores={{
                 circadian: percentIndices.cii,
                 autonomic: percentIndices.ali,
                 legibility: percentIndices.pli,
                 sensory: percentIndices.stl,
                 recovery: percentIndices.rci
               }} 
               profile={profile} 
             />
          </div>

        </div>
      </div>
    </div>
  )
}
