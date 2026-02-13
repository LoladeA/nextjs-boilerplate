import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react' // Import Icon for loader
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
  
  // 1. FETCH DATA
  const [responsesRes, logsRes] = await Promise.all([
    supabase.from('user_responses').select('*').eq('user_id', user.id),
    supabase.from('daily_logs').select('mood_score, date').eq('user_id', user.id).order('date', { ascending: false }).limit(7)
  ])

  const safeResponses = responsesRes.data || []
  const recentLogs = logsRes.data || []

  // 2. UX INTERCEPTION: If no data, show "Calibrating" while GuestSync works
  if (safeResponses.length === 0) {
    return (
      <>
        <GuestSync /> {/* This works invisibly to upload the data */}
        
        {/* VISUAL LOADING STATE */}
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1b270e] text-[#b5a642]">
            <div className="animate-pulse flex flex-col items-center gap-4">
               <Activity size={48} />
               <h2 className="text-2xl font-serif">Calibrating your profile...</h2>
               <p className="text-[#c9ccbb]/80 text-sm uppercase tracking-widest">Syncing bio-data</p>
            </div>
            
            {/* Fallback: In case they genuinely haven't taken the test */}
            <div className="mt-8 opacity-0 animate-in fade-in delay-[3000ms] fill-mode-forwards duration-1000">
               <a href="/assessments/step0" className="text-xs text-[#c9ccbb]/70 hover:text-[#b5a642] underline">
                  Stuck? Retake Assessment
               </a>
            </div>
        </div>
      </>
    )
  }

  // 3. CALCULATE ENGINES (Only happens if we have data)
  const { totalLoad, systemState, radarData } = calculateNeuroLoad(safeResponses)
  
  const getVal = (id: string) => safeResponses.find(r => r.question_key === id)?.answer?.response || 0
  const circadianLoad = Number(getVal('q5')) + Number(getVal('q6')) + Number(getVal('q7')) + Number(getVal('q8')) + Number(getVal('q9'))

  // 4. RENDER DASHBOARD
  return (
    <>
      <GuestSync /> {/* Keep this here just in case of late syncs */}
      <DashboardUI 
        user={user}
        displayName={displayName}
        recentLogs={recentLogs}
        totalLoad={totalLoad}
        systemState={systemState}
        radarData={radarData}
        circadianLoad={circadianLoad}
      />
    </>
  )
}
