import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

    supabase
      .from('assessment_snapshots')
      .select('id, neuro_load, created_at, snapshot_type')
      .eq('user_id', user.id)
      .eq('snapshot_type', 'baseline')
      .order('created_at', { ascending: true })
      .limit(1)
      .single(),

    supabase
      .from('assessment_snapshots')
      .select('id, neuro_load, created_at, snapshot_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ])

  const safeResponses = responsesRes.data  || []
  const recentLogs    = logsRes.data        || []
  const baselineSnap  = baselineSnapshotRes.data || null
  const latestSnap    = latestSnapshotRes.data   || null

  // --- NO ASSESSMENT YET ---
  // User is authenticated but has not completed the baseline assessment.
  // Pass hasAssessment: false — DashboardUI renders the empty state banner
  // and null-safe metric cards. GuestSync still mounts to catch any
  // in-flight guest data that may arrive after OAuth redirect.
  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e]">
        <GuestSync />
        <DashboardUI
          user={user}
          displayName={displayName}
          recentLogs={[]}
          totalLoad={null}
          systemState={null}
          radarData={[]}
          circadianLoad={0}
          profile="anchor"
          hasAssessment={false}
          nudge={{ show: false, level: 'none', days_elapsed: 0, label: '', sublabel: '' }}
          loadDelta={null}
        />
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
    baselineSnap?.created_at ?? null,
    latestSnap?.snapshot_type === 'update' ? latestSnap.created_at : null
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
        hasAssessment={true}
        nudge={nudge}
        loadDelta={loadDelta}
      />
    </div>
  )
}
