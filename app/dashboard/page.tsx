import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react' 
import DashboardUI from './DashboardUI'
import GuestSync from '../components/GuestSync'
import { calculateNeuroLoad } from '../utils/scoring-engine' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // 1. FETCH DATA (30 days for the 14-day rhythm chart)
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('user_responses').select('*').eq('user_id', user.id),
    supabase
      .from('daily_logs')
      .select('*') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) 
      .limit(30) 
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  // 2. UX INTERCEPTION: If no data, show "Calibrating"
  if (safeResponses.length === 0) {
    return (
      <>
        <GuestSync /> 
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b270e] text-[#b5a642]">
            <div className="animate-pulse flex flex-col items-center gap-4">
               <Activity size={48} />
               <h2 className="text-2xl font-serif">Calibrating your profile...</h2>
               <p className="text-[#c9ccbb]/80 text-sm uppercase tracking-widest">Syncing bio-data</p>
            </div>
            <div className="mt-8 opacity-0 animate-in fade-in delay-[3000ms] fill-mode-forwards duration-1000">
               <a href="/assessments/step0" className="text-xs text-[#c9ccbb]/70 hover:text-[#b5a642] underline">
                 Stuck? Retake Assessment
               </a>
            </div>
        </div>
      </>
    )
  }

  // 3. CALCULATE ENGINES (Using the NEW v2.0 Logic)
  // We use 'any' here temporarily to prevent TS errors during the migration swap
  const engineResult: any = calculateNeuroLoad(safeResponses)
  
  // 4. MAP NEW ENGINE DATA TO OLD UI PROPS
  const { finalNeuroLoad, systemState, percentIndices, rawIndices } = engineResult

  // Map the new 'percentIndices' to the structure the Radar Chart expects
  const radarData = [
    { subject: 'Circadian', A: Math.round(percentIndices.cii), fullMark: 100 },
    { subject: 'Autonomic', A: Math.round(percentIndices.ali), fullMark: 100 },
    { subject: 'Predictive', A: Math.round(percentIndices.pli), fullMark: 100 },
    { subject: 'Sensory', A: Math.round(percentIndices.stl), fullMark: 100 },
    { subject: 'Recovery', A: Math.round(percentIndices.rci), fullMark: 100 }
  ]

  // 5. RENDER DASHBOARD
  return (
    <>
      <GuestSync /> 
      <DashboardUI 
        user={user}
        displayName={displayName}
        recentLogs={recentLogs}
        totalLoad={finalNeuroLoad} // 🟢 UPDATED: Passed the new weighted score
        systemState={systemState}
        radarData={radarData}      // 🟢 UPDATED: Passed the new mapped array
        circadianLoad={rawIndices?.cii || 0} // 🟢 UPDATED: Passed raw score for flashcard logic
      />
    </>
  )
}
