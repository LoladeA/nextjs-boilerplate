import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Activity, ArrowRight } from 'lucide-react' 
import Link from 'next/link'
import DashboardUI from './DashboardUI'
import GuestSync from '../components/GuestSync'
import { calculateNeuroLoad } from '../utils/scoring-engine' 
import { mapEngineToDashboard } from '@/app/lib/neuro-mapper'
import { shouldShowNudge } from '@/app/lib/baseline-delta-engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // --- AUTH ---
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member'

  // --- FETCH ALL DATA IN PARALLEL ---
  const [responsesRes, logsRes, baselineSnapshotRes, latestSnapshotRes] = await Promise.all([
    supabase
      .from('current_user_responses')
      .select('*')
      .eq('user_id', user.id),

    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),

    // First snapshot ever — original baseline
    supabase
      .from('assessment_snapshots')
      .select('id, neuro_load, created_at, snapshot_type')
      .eq('user_id', user.id)
      .eq('snapshot_type', 'baseline')
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),

    // Most recent snapshot — could be baseline or update
    supabase
      .from('assessment_snapshots')
      .select('id, neuro_load, created_at, snapshot_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ])

  const safeResponses  = responsesRes.data      || []
  const recentLogs      = logsRes.data            || []
  const baselineSnap   = baselineSnapshotRes.data || null
  const latestSnap      = latestSnapshotRes.data   || null

  // --- PLG SHIELD: NO RESPONSES YET ---
  // Replaced passive loader with an active gateway to Step 0
  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center">
        <GuestSync /> 
        <div className="max-w-md w-full glass-panel p-10 rounded-[2rem] border border-[#c9ccbb]/10 shadow-2xl">
          <Activity className="text-[#b5a642] mx-auto mb-6 animate-pulse" size={48} />
          <h1 className="text-3xl font-serif text-[#c9ccbb] mb-4">Calibrating Your Baseline</h1>
          <p className="text-[#c9ccbb]/70 text-sm mb-8 leading-relaxed">
            Your sensory profile is the foundation of the Sentient Home. 
            To activate your intelligence layer and calculate your baseline NeuroLoad, 
            we require your initial assessment data.
          </p>
          <Link 
            href="/assessments/step0"
            className="group flex items-center justify-center gap-3 bg-[#b5a642] text-[#1b270e] px-8 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#c9ccbb] hover:scale-[1.02]"
          >
            Begin Baseline Assessment
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-6 text-[10px] text-[#c9ccbb]/40 uppercase tracking-widest">
            Estimated time: 10 minutes
          </p>
        </div>
      </div>
    )
  }

  // --- SCORING ENGINE ---
  const neuroLensAnswer = safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value || 'None'
  
  const engineResult = calculateNeuroLoad(
    safeResponses.map((r: any) => ({
      question_key: r.question_key,
      answer: { response: r.answer_value } 
    })),
    neuroLensAnswer 
  )

  const dashboardProfile = mapEngineToDashboard(engineResult.sensoryProfile)
  
  const { finalNeuroLoad, systemState, percentIndices, rawIndices } = engineResult

  const radarData = [
    { subject: 'Circadian',  A: Math.round(percentIndices.cii), fullMark: 100 },
    { subject: 'Autonomic',  A: Math.round(percentIndices.ali), fullMark: 100 },
    { subject: 'Predictive', A: Math.round(percentIndices.pli), fullMark: 100 },
    { subject: 'Sensory',    A: Math.round(percentIndices.stl), fullMark: 100 },
    { subject: 'Recovery',   A: Math.round(percentIndices.rci), fullMark: 100 }
  ]

  // --- NUDGE CHECK ---
  const nudge = shouldShowNudge(
    baselineSnap?.created_at    ?? null,
    latestSnap?.snapshot_type === 'update'
      ? latestSnap.created_at
      : null
  )

  // --- LOAD DELTA ---
  const loadDelta = (
    latestSnap &&
    baselineSnap &&
    latestSnap.snapshot_type === 'update'
  )
    ? latestSnap.neuro_load - baselineSnap.neuro_load
    : null

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
        nudge={nudge}
        loadDelta={loadDelta}
      />
    </div>
  )
}
