import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardUI from './DashboardUI' // <--- The only new import
import { calculateNeuroLoad } from '../utils/scoring-engine' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'
  
  // 1. FETCH DATA (Stays exactly the same)
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('mood_score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(7)
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  if (safeResponses.length === 0) redirect('/assessments/step0')
  
  // 2. CALCULATE ENGINES (Stays exactly the same)
  const { totalLoad, systemState, radarData } = calculateNeuroLoad(safeResponses)
  
  const getVal = (id: string) => safeResponses.find(r => r.question_key === id)?.answer?.response || 0
  const circadianLoad = Number(getVal('q5')) + Number(getVal('q6')) + Number(getVal('q7')) + Number(getVal('q8')) + Number(getVal('q9'))

  // 3. RENDER (This is the change)
  // We pass the calculated data down to the UI component
  return (
    <DashboardUI 
      user={user}
      displayName={displayName}
      recentLogs={recentLogs}
      totalLoad={totalLoad}
      systemState={systemState}
      radarData={radarData}
      circadianLoad={circadianLoad}
    />
  )
}
