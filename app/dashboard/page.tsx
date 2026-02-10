import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// ADDED "Sun" to imports below
import { FileText, Heart, Camera, Sparkles, Plus, PlayCircle, CheckCircle, Lock, Sun } from 'lucide-react' 

import ActionCard from '../components/ActionCard'
import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import DashboardPulse from '../components/DashboardPulse' 
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import Sidebar from '../components/Sidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// --- THE COACHING CURRICULUM (With Paywall Logic) ---
const CURRICULUM = [
  { 
    slug: 'sensory-orientation', 
    title: 'Week 0: Sensory Orientation', 
    subtitle: 'Understanding your biological baseline.',
    isPremium: false 
  },
  { 
    slug: 'silent-conversation', 
    title: 'Week 1: Silent Conversation', 
    subtitle: 'Cognitive load & environmental vigilance.',
    isPremium: true // LOCKED
  },
  { 
    slug: 'light-as-signal', 
    title: 'Week 2: Light as Signal', 
    subtitle: 'Circadian rhythms and cortisol control.',
    isPremium: true // LOCKED
  }
]

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // 1. FETCH DATA
  const [responsesRes, logsRes, progressRes] = await Promise.all([
    supabase.from('user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('mood_score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(7),
    supabase.from('module_progress').select('module_slug').eq('user_id', user.id)
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []
  const completedModules = (progressRes.data || []).map(r => r.module_slug)

  if (safeResponses.length === 0) redirect('/assessments/step0')
  
  // 2. CALCULATE ENGINES
  const { totalLoad, systemState, radarData } = calculateNeuroLoad(safeResponses)
  
  const getVal = (id: string) => safeResponses.find(r => r.question_key === id)?.answer?.response || 0
  const circadianLoad = Number(getVal('q5')) + Number(getVal('q6')) + Number(getVal('q7')) + Number(getVal('q8')) + Number(getVal('q9'))

  // 3. DETERMINE NEXT STEP & LOCK STATUS
  const nextModule = CURRICULUM.find(m => !completedModules.includes(m.slug)) || CURRICULUM[CURRICULUM.length - 1]
  const isAllComplete = completedModules.length === CURRICULUM.length
  
  // Logic: If it's premium, send to Upgrade. If free, send to Class.
  const isLocked = nextModule.isPremium 
  const targetLink = isLocked ? '/upgrade' : `/coaching/${nextModule.slug}`

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      <Sidebar />

      <div className="md:ml-64 min-h-screen p-6 md:p-12">
      
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <div className="relative w-64 h-16 mb-2">
              <Image src="/logo.PNG" alt="Sensory Intelligence" fill className="object-contain object-left" priority />
            </div>
            <p className="text-[#c9ccbb]/60 font-light capitalize">
              Welcome back, {displayName}.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
              <FileText size={16} className="text-[#b5a642]" />
              View Report
            </Link>
            <Link href="/assessments/step0" className="flex items-center gap-2 px-6 py-3 bg-[#c9ccbb] text-[#1b270e] hover:bg-[#e3e6d5] rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#000]/20">
              <Plus size={16} />
              Retake Assessment
            </Link>
          </div>
        </div>

        {/* --- SECTION 1: THE COCKPIT --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-[#c9ccbb] font-serif text-xl">Nervous System Rhythm</h3>
                        <p className="text-[#c9ccbb]/50 text-xs uppercase tracking-widest mt-1">Last 7 Days Trend</p>
                    </div>
                    {recentLogs.length > 0 && (
                         <div className="text-right">
                             <div className="text-2xl font-serif text-[#c9ccbb]">{recentLogs[0].mood_score}<span className="text-sm text-[#c9ccbb]/40">/5</span></div>
                             <div className="text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest">Latest Log</div>
                         </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 opacity-80 pointer-events-none">
                    <DashboardPulse logs={recentLogs} />
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden border-l-4 border-[#b5a642]">
                <div className="relative z-10">
                    <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Current Baseline</div>
                    <div className="text-5xl font-serif text-[#c9ccbb] mb-2">{totalLoad}</div>
                    <div className="text-sm text-[#c9ccbb]/60 mb-4">{systemState}</div>
                    <div className="text-[10px] text-[#c9ccbb]/30 uppercase tracking-widest">NeuroLoad Score™</div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl" />
            </div>
        </div>

        {/* --- SECTION 2: NEXT BEST STEP (Smart Paywall) --- */}
        <div className="mb-12">
            <h3 className="text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Recommended Action
            </h3>
            
            <Link href={targetLink} className="block group">
                <div className={`
                    p-8 md:p-10 rounded-3xl border transition-all relative overflow-hidden
                    ${isLocked 
                        ? 'bg-gradient-to-br from-[#b5a642]/20 to-[#1b270e] border-[#b5a642]/40' // GOLD/LOCKED
                        : 'glass-panel border-[#c9ccbb]/10 hover:border-[#b5a642]/50' // STANDARD/FREE
                    }
                `}>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-4
                                ${isLocked ? 'bg-[#b5a642] text-[#1b270e]' : 'bg-[#b5a642] text-[#1b270e]'}
                            `}>
                                {isAllComplete ? "Review" : isLocked ? "Locked Content" : "Up Next"}
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-serif mb-2 transition-colors ${isLocked ? 'text-[#f0e6b5]' : 'text-[#c9ccbb] group-hover:text-[#b5a642]'}`}>
                                {nextModule.title}
                            </h2>
                            <p className="text-[#c9ccbb]/60 text-lg max-w-xl">
                                {nextModule.subtitle}
                            </p>
                        </div>
                        
                        <div className={`
                            h-16 w-16 rounded-full flex items-center justify-center transition-all shrink-0
                            ${isLocked 
                                ? 'bg-[#b5a642]/20 text-[#b5a642] border border-[#b5a642]/50' 
                                : 'bg-[#b5a642]/10 border border-[#b5a642]/20 text-[#b5a642] group-hover:scale-110 group-hover:bg-[#b5a642] group-hover:text-[#1b270e]'
                            }
                        `}>
                            {isLocked ? <Lock size={28} /> : isAllComplete ? <CheckCircle size={32} /> : <PlayCircle size={32} />}
                        </div>
                    </div>
                </div>
            </Link>
        </div>

        {/* --- SECTION 3: INTELLIGENCE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Your Sensory Profile</h3>
                <p className="text-sm text-[#c9ccbb]/50">Circadian • Autonomic • Predictive • Sensory • Recovery</p>
              </div>
              <Link href="/assessments/report" className="text-xs text-[#b5a642] uppercase tracking-widest hover:text-[#c9ccbb] transition-colors">
                Analyse Details →
              </Link>
            </div>
            <div className="h-[300px] w-full">
              <SensoryRadar data={radarData} />
            </div>
          </div>

          <div className="h-full">
            <NeuroFlashcard 
              isPremium={false} 
              scores={{
                light: circadianLoad > 15 ? 40 : 80,
                visual: radarData[2].A, 
                acoustic: radarData[3].A 
              }}
            />
          </div>
        </div>

        {/* --- SECTION 4: TOOLKIT --- */}
        <div className="mb-4">
            <h3 className="text-[#c9ccbb]/40 text-xs font-bold uppercase tracking-widest mb-4">Toolkit</h3>
            <SensoryTools />
        </div>
      
        {/* UPDATED GRID: Added Light Logic Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
          <ActionCard 
            title="Log Well-being" 
            desc="Track your mood & focus." 
            icon={<Heart size={32} />} 
            href="/progress"  
            delay={0.5} 
          />
          <ActionCard 
            title="Document Space" 
            desc="Upload photos to track changes." 
            icon={<Camera size={32} />} 
            href="/room-audit"  
            delay={0.6} 
          />
          <ActionCard 
            title="Light Logic™" 
            desc="Check circadian alignment." 
            icon={<Sun size={32} />} 
            href="/tools/light-meter"  
            delay={0.7} 
          />
          <ActionCard 
            title="Sensory Coaching" 
            desc="Full curriculum access." 
            icon={<Sparkles size={32} />} 
            href="/coaching" 
            delay={0.8} 
          />
        </div>

      </div>
    </div>
  )
}
