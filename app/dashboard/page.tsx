import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react' 
import DashboardUI from './DashboardUI'
import GuestSync from '../components/GuestSync'
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import { getPrecisionProfile } from '@/app/lib/neuro-mapper' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // 1. ROOT FIX: Fetch from the 'current_user_responses' VIEW
  // This guarantees we only get the single latest answer for each question.
  const [responsesRes, logsRes] = await Promise.all([
    supabase
      .from('current_user_responses') // 🟢 TARGET THE VIEW
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('daily_logs')
      .select('*') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) 
      .limit(30) 
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  // 2. UX INTERCEPTION
  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e]"> 
        <GuestSync /> 
        <div className="min-h-screen flex flex-col items-center justify-center text-[#b5a642]">
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
      </div>
    )
  }

  // 3. CALCULATE ENGINE RESULTS
  const engineResult = calculateNeuroLoad(safeResponses)

  // 4. DETERMINE SENSORY PROFILE
  // 🟢 CRITICAL FIX: Use 'question_key' to match your database schema
  const neuroLensAnswer = safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value
  const sensoryDirAnswer = safeResponses.find((r: any) => r.question_key === 'sensory_direction')?.answer_value
  
  // Run the logic: HSP -> Sensor
  const userProfile = getPrecisionProfile(neuroLensAnswer, sensoryDirAnswer)
  
  // 5. MAP ENGINE DATA TO UI PROPS
  const { finalNeuroLoad, systemState, percentIndices, rawIndices } = engineResult

  const radarData = [
    { subject: 'Circadian', A: Math.round(percentIndices.cii), fullMark: 100 },
    { subject: 'Autonomic', A: Math.round(percentIndices.ali), fullMark: 100 },
    { subject: 'Predictive', A: Math.round(percentIndices.pli), fullMark: 100 },
    { subject: 'Sensory', A: Math.round(percentIndices.stl), fullMark: 100 },
    { subject: 'Recovery', A: Math.round(percentIndices.rci), fullMark: 100 }
  ]

 // 6. RENDER DASHBOARD
 return (
   <div className="min-h-screen bg-[#1b270e]"> 
     <GuestSync /> 
     <DashboardUI 
       user={user}
       displayName={displayName}
       recentLogs={recentLogs}
       totalLoad={finalNeuroLoad}
       systemState={systemState}
       radarData={radarData}      
       circadianLoad={rawIndices?.cii || 0}
       profile={userProfile} 
     />
   </div>
 )
}
