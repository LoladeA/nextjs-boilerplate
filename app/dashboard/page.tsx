import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react' 
import DashboardUI from './DashboardUI'
import GuestSync from '../components/GuestSync'
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import { mapEngineToDashboard } from '@/app/lib/neuro-mapper' 
import GuestTransferHandler from '@/app/components/GuestTransferHandler'

// Inside the return, anywhere at the top level:
<GuestTransferHandler />

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // --- AUTH LOGIC ---
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'

  // --- FETCH DATA ---
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('current_user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
  ])
  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  // 🟢 THE PLG SHIELD: Prevent the server crash & allow GuestSync to run
  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center">
        {/* GuestSync mounts, finds localStorage, pushes to Supabase, and forces a router.refresh() */}
        <GuestSync /> 
        
        <Activity className="text-[#b5a642] animate-pulse mb-6" size={48} />
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-3">Calibrating Your Baseline...</h1>
        <p className="text-[#c9ccbb]/70 text-sm max-w-md mx-auto">
          Synchronizing your sensory profile with the intelligence engine. This will just take a moment.
        </p>
      </div>
    )
  }

  // 🟢 1. EXTRACT NEURO LENS
  const neuroLensAnswer = safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value
  
  // 🟢 2. RUN THE NEW SCORING ENGINE
  const engineResult = calculateNeuroLoad(
    safeResponses.map((r: any) => ({
      question_key: r.question_key,
      answer: { response: r.answer_value } 
    })),
    neuroLensAnswer 
  )

  // 🟢 3. MAP TO DASHBOARD IDENTITY
  const dashboardProfile = mapEngineToDashboard(engineResult.sensoryProfile)
  
  // 🟢 4. MAP RADAR DATA
  const { finalNeuroLoad, systemState, percentIndices, rawIndices } = engineResult
  const radarData = [
    { subject: 'Circadian', A: Math.round(percentIndices.cii), fullMark: 100 },
    { subject: 'Autonomic', A: Math.round(percentIndices.ali), fullMark: 100 },
    { subject: 'Predictive', A: Math.round(percentIndices.pli), fullMark: 100 },
    { subject: 'Sensory', A: Math.round(percentIndices.stl), fullMark: 100 },
    { subject: 'Recovery', A: Math.round(percentIndices.rci), fullMark: 100 }
  ]

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
        profile={dashboardProfile} 
      />
    </div>
  )
}
