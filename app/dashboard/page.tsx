import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FileText } from 'lucide-react' 

import SensoryTools from '../components/SensoryTools'
import SensoryRadar from '../components/SensoryRadar'
import NeuroFlashcard from '../components/NeuroFlashcard'
import DashboardPulse from '../components/DashboardPulse' 
import RitualsInterface from '../components/RitualsInterface' 
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import Sidebar from '../components/Sidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // 1. FETCH DATA
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('mood_score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(7)
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  if (safeResponses.length === 0) redirect('/assessments/step0')
  
  // 2. CALCULATE ENGINES
  const { totalLoad, systemState, radarData } = calculateNeuroLoad(safeResponses)
  
  const getVal = (id: string) => safeResponses.find(r => r.question_key === id)?.answer?.response || 0
  const circadianLoad = Number(getVal('q5')) + Number(getVal('q6')) + Number(getVal('q7')) + Number(getVal('q8')) + Number(getVal('q9'))

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      
      <Sidebar />

      <div className="md:ml-64 min-h-screen p-6 md:p-12">
      
        {/* HEADER: GREETING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="relative w-64 h-16 mb-2">
              <Image src="/logo.PNG" alt="Sensory Intelligence" fill className="object-contain object-left" priority />
            </div>
            <p className="text-[#c9ccbb]/80 font-light capitalize text-lg">
              Welcome back, <span className="text-[#c9ccbb] font-normal">{displayName}</span>.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/assessments/report" className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-[#c9ccbb]/10 text-[#c9ccbb] rounded-lg text-sm font-medium transition-all">
              <FileText size={16} className="text-[#b5a642]" />
              View Report
            </Link>
          </div>
        </div>

        {/* --- ROW 1: STATS (RHYTHM + SCORE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* RHYTHM */}
            <div className="md:col-span-2 glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] border border-[#c9ccbb]/10">
                <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-[#c9ccbb] font-serif text-xl">Nervous System Rhythm</h3>
                        <p className="text-[#c9ccbb]/80 text-xs uppercase tracking-widest mt-1">Last 7 Days Trend</p>
                    </div>
                    {recentLogs.length > 0 && (
                         <div className="text-right">
                             <div className="text-2xl font-serif text-[#c9ccbb]">{recentLogs[0].mood_score}<span className="text-sm text-[#c9ccbb]/40">/5</span></div>
                             <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">Latest Log</div>
                         </div>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-40 opacity-80 pointer-events-none">
                    <DashboardPulse logs={recentLogs} />
                </div>
            </div>

            {/* BASELINE SCORE */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center items-center text-center relative overflow-hidden border-l-4 border-[#b5a642]">
                <div className="relative z-10">
                    <div className="text-[10px] text-[#b5a642] font-bold uppercase tracking-widest mb-2">Current Baseline</div>
                    <div className="text-5xl font-serif text-[#c9ccbb] mb-2">{totalLoad}</div>
                    <div className="text-sm text-[#c9ccbb]/80 mb-4">{systemState}</div>
                    <div className="text-[10px] text-[#c9ccbb]/80 uppercase tracking-widest">NeuroLoad Score™</div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#b5a642]/10 rounded-full blur-2xl" />
            </div>
        </div>

        {/* --- ROW 2: INTELLIGENCE (RADAR + FLASHCARD) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* SENSORY PROFILE */}
          <div className="lg:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden border border-[#c9ccbb]/10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-serif text-[#c9ccbb] text-xl mb-1">Your Sensory Profile</h3>
                <p className="text-sm text-[#c9ccbb]/80">Circadian • Autonomic • Predictive • Sensory • Recovery</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <SensoryRadar data={radarData} />
            </div>
          </div>

          {/* SOMATIC INSIGHT */}
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

        {/* --- ROW 3: RITUALS (ACCORDION) --- */}
        <div className="mb-8">
             <RitualsInterface neuroLoadScore={totalLoad} />
        </div>

        {/* --- ROW 4: TOOLKIT --- */}
        <div className="mb-4">
            <h3 className="text-[#c9ccbb]/80 text-xs font-bold uppercase tracking-widest mb-6">Toolkit</h3>
            <SensoryTools />
        </div>
      
      </div>
    </div>
  )
}
}
