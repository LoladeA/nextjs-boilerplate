import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Activity, Brain, ShieldAlert, Zap, Download, Fingerprint, CheckCircle } from 'lucide-react'
// 🟢 IMPORT: The Engine types to ensure type safety
import { calculateNeuroLoad, NeuroLens } from '@/app/utils/scoring-engine' 
import { getPrecisionProfile } from '@/app/lib/neuro-mapper'
import Sidebar from '../../components/Sidebar'
import PriorityList from './PriorityList'
import HumanScorecard from '../../components/HumanScorecard'

export const dynamic = 'force-dynamic'

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Fetch responses
  const { data: responses } = await supabase
    .from('user_responses')
    .select('*')
    .eq('user_id', session?.user.id)

  const safeResponses = responses || []

  // =========================================================
  // 1. EXTRACT IDENTITY (For Math & Language)
  // =========================================================
  
  // Get raw DB values
  const rawLens = safeResponses.find((r: any) => r.question_id === 'neuro_lens')?.answer_value || 'None'
  const sensoryDir = safeResponses.find((r: any) => r.question_id === 'sensory_direction')?.answer_value || 'Neutral'

  // A. For Language (Descriptions): Seeker vs Sensor
  const profile = getPrecisionProfile(rawLens, sensoryDir) 

  // B. For Math (Scoring Engine): ADHD vs Autism vs Neurotypical
  // We must normalize the DB string to match the Engine's strict type
  let engineLens: NeuroLens = 'neurotypical'
  const lowerLens = rawLens.toLowerCase()
  if (lowerLens.includes('adhd')) engineLens = 'adhd'
  else if (lowerLens.includes('autism')) engineLens = 'autism'
  else if (lowerLens.includes('hsp')) engineLens = 'hsp'

  // =========================================================
  // 2. RUN CALCULATION (With Neuro-Weights)
  // =========================================================

  // 🟢 CRITICAL FIX: Pass 'engineLens' to the calculator so weights apply
  const engineResult = calculateNeuroLoad(safeResponses, engineLens)
  
  const { 
    rawIndices, 
    percentIndices, 
    finalNeuroLoad, 
    systemState, 
    priorityDomains // Use the engine's smart sorting, not raw thresholds
  } = engineResult

  // =========================================================
  // 3. CONFIGURE UI DOMAINS
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
      status: rawIndices.cii <= 10 ? 'Regulated' : rawIndices.cii <= 15 ? 'Drifting' : 'Dysregulated',
      icon: <Zap size={24} className={rawIndices.cii > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'ali',
      name: 'Autonomic Load',
      score: rawIndices.ali,
      max: 20,
      description: profile === 'sensor'
        ? 'Background vigilance caused by sensory friction.' 
        : 'Nervous system activation and stress axis load.',
      status: rawIndices.ali <= 7 ? 'Stable' : rawIndices.ali <= 11 ? 'Activated' : 'High Vigilance',
      icon: <Activity size={24} className={rawIndices.ali > 11 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'pli',
      name: 'Predictive Legibility',
      score: rawIndices.pli,
      max: 25,
      description: profile === 'seeker'
        ? 'Are your visual cues working or disappearing?' 
        : 'Spatial clarity and cognitive friction.',
      status: rawIndices.pli <= 10 ? 'Legible' : rawIndices.pli <= 15 ? 'Frictional' : 'Fragmented',
      icon: <Brain size={24} className={rawIndices.pli > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'stl',
      name: 'Sensory Load',
      score: rawIndices.stl,
      max: 25,
      description: profile === 'sensor'
        ? 'Pain-point triggers: Glare, Echo, Texture.' 
        : profile === 'seeker' 
          ? 'Under-stimulation vs. Distraction balance.' 
          : 'Cumulative impact of noise, clutter, and texture.',
      status: rawIndices.stl <= 10 ? 'Optimized' : rawIndices.stl <= 15 ? 'Moderate' : 'Overload',
      icon: <ShieldAlert size={24} className={rawIndices.stl > 15 ? "text-red-400" : "text-[#b5a642]"} />
    },
    {
      id: 'rci',
      name: 'Recovery Potential',
      score: rawIndices.rci,
      max: 25,
      description: profile === 'seeker'
        ? 'Ability of the home to provide active regulation (fidget/movement).'
        : 'Capacity of the home to support parasympathetic restoration (calm).',
      status: rawIndices.rci < 10 ? 'High Potential' : rawIndices.rci <= 15 ? 'Moderate' : 'Low Potential',
      icon: <CheckCircle size={24} className={rawIndices.rci > 15 ? "text-red-400" : "text-[#b5a642]"} />
    }
  ]

  // =========================================================
  // 4. DETERMINE CRITICAL ISSUES (Smart Sorting)
  // =========================================================

  // 🟢 CRITICAL FIX: Use the Engine's priority list (which accounts for interaction flags)
  // map the engine's top IDs back to our rich domain objects
  const criticalIssues = priorityDomains
    .map(p => domains.find(d => d.id === p.id))
    .filter(Boolean) as typeof domains

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">
        
        <Link href="/dashboard" className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors w-fit">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">Your NeuroLoad Overview</h1>
              <p className="text-[#c9ccbb]/70">How your home interacts with your <strong>{engineLens === 'neurotypical' ? 'Nervous System' : engineLens.toUpperCase()}</strong> profile.</p>
            </div>
            
            {/* Identity Badge */}
            <div className="flex items-center gap-3 px-5 py-2 bg-[#b5a642]/10 rounded-full border border-[#b5a642]/20">
              <Fingerprint size={18} className="text-[#b5a642]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-[#b5a642] font-bold">Sensory Profile</span>
                <span className="text-[#c9ccbb] text-sm capitalize">The {profile}</span>
              </div>
            </div>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
             <div className="relative z-10">
               <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">Current System State</span>
               <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">{systemState}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{finalNeuroLoad}<span className="text-base text-[#c9ccbb]/80 font-normal">/100</span></div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">NeuroLoad Score™</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{criticalIssues.length}</div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">Priority Areas</div>
                 </div>
                 <div>
                   <div className="text-3xl font-bold text-[#c9ccbb]">{domains.find(d=>d.id === 'rci')?.status}</div>
                   <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">Recovery Status</div>
                 </div>
               </div>
             </div>
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
          </div>

          {/* PRIORITY FOCUS AREAS */}
          {criticalIssues.length > 0 && (
             <div className="mb-16">
               <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Your Priority Actions</h3>
               {/* Pass the calculated profile to the list so recommendations align */}
               <PriorityList areas={criticalIssues} profile={profile} />
             </div>
          )}

          {/* DETAILED ANALYSIS */}
          <div className="mb-16">
             <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Detailed Analysis</h3>
             <HumanScorecard scores={{
                circadian: percentIndices.cii,
                autonomic: percentIndices.ali,
                legibility: percentIndices.pli,
                sensory: percentIndices.stl
             }} />
          </div>

        </div>
      </div>
    </div>
  )
}
