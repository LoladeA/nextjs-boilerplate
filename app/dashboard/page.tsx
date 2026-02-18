import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react' 
import DashboardUI from './DashboardUI'
import GuestSync from '../components/GuestSync'
// 🟢 UPDATE IMPORTS
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import { mapEngineToDashboard } from '@/app/lib/neuro-mapper' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // ... (Auth Logic stays same)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'

  // ... (Fetch Data Logic stays same)
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('current_user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
  ])
  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  // ... (Guest Sync Logic stays same)
  if (safeResponses.length === 0) { /* ... */ }

  // 🟢 1. EXTRACT NEURO LENS (From the new 'part0' questions)
  // We look for 'neuro_lens' specifically
  const neuroLensAnswer = safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value
  
  // 🟢 2. RUN THE NEW SCORING ENGINE
  // This calculates the load AND the sensory profile (Threshold/Regulation)
  const engineResult = calculateNeuroLoad(
    safeResponses.map((r: any) => ({
      question_key: r.question_key,
      answer: { response: r.answer_value } // Ensure structure matches engine expectation
    })),
    neuroLensAnswer // Pass the string (e.g., "ADHD"), engine handles normalization
  )

  // 🟢 3. MAP TO DASHBOARD IDENTITY
  // Use the calculated sensory profile from the engine, not just the raw questions
  const dashboardProfile = mapEngineToDashboard(engineResult.sensoryProfile)
  
  // 4. MAP RADAR DATA
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
        profile={dashboardProfile} // 🟢 Passes 'anchor' | 'seeker' | 'sensor'
      />
    </div>
  )
}
