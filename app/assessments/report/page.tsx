import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity, Brain, ShieldAlert, Zap, CheckCircle, AlertCircle } from 'lucide-react'

// ENGINE
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'

// MAPPING
import { mapEngineToDashboard, getProfileDisplayName } from '@/app/lib/neuro-mapper'

// COMPONENTS
import OrbitalBadge from '../../components/OrbitalBadge'
import Sidebar from '../../components/Sidebar'
import PriorityList from './PriorityList'
import HumanScorecard from '../../components/HumanScorecard'

export const dynamic = 'force-dynamic'

// ============================================================
// RECOVERY MODIFIER — display labels
// ============================================================
const RECOVERY_MODIFIER_LABELS: Record<string, string> = {
  protective:  'Protective',
  compounding: 'Compounding',
  neutral:     'Neutral'
}

// ============================================================
// INTEGRATION PATTERN — display labels
// ============================================================
const INTEGRATION_PATTERN_LABELS: Record<string, string> = {
  integrative:  'Integrative',
  mixed:        'Variable',
  accumulative: 'Accumulative'
}

// ============================================================
// INTEGRATION PATTERN — contextual subtitles for the card
// ============================================================
const INTEGRATION_PATTERN_SUBTITLES: Record<string, string> = {
  integrative:
    'Sensation tends to resolve with recovery. Your environment works best when recovery windows are genuine and protected.',
  mixed:
    'Your processing pattern shifts with load and context. Consistency matters more on high-demand days.',
  accumulative:
    'Sensation layers and persists. Environmental consistency is not a preference — it is a biological requirement.'
}

export default async function AssessmentReport() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: responses } = await supabase
    .from('current_user_responses')
    .select('*')
    .eq('user_id', session.user.id)

  const safeResponses = responses || []

  const neuroLensAnswer =
    safeResponses.find((r: any) => r.question_key === 'neuro_lens')?.answer_value ||
    'None'

  if (safeResponses.length === 0) {
    return (
      <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center p-6 text-center font-sans">
        <Activity className="text-[#b5a642] animate-pulse mb-6" size={48} />
        <h1 className="text-3xl font-serif text-[#c9ccbb] mb-3">Calibrating Report...</h1>
        <p className="text-[#c9ccbb]/70 text-sm max-w-md mx-auto mb-8">
          Your sensory data is currently synchronising. Please return to the dashboard
          to complete the baseline calibration.
        </p>
        <Link href="/dashboard">
          <button className="px-8 py-3 bg-[#b5a642] text-[#1b270e] font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-white transition-all">
            Return to Dashboard
          </button>
        </Link>
      </div>
    )
  }

  // ============================================================
  // COERCE RESPONSES
  // Includes q_int1–q_int3: integration pattern questions score
  // as numeric scale responses, same as all other scale questions.
  // ============================================================
  const NUMERIC_KEYS = new Set([
    'energy_tax',
    'q5', 'q6', 'q7', 'q8', 'q9',
    'q10', 'q11', 'q12', 'q13', 'q14',
    'q15', 'q16', 'q17', 'q18', 'q19',
    'q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26',
    'q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33',
    // Integration pattern questions — Part 0 expansion
    'q_int1', 'q_int2', 'q_int3'
  ])

  const engineInput = safeResponses.map((r: any) => {
    const raw = r.answer_value
    const coerced = NUMERIC_KEYS.has(r.question_key) ? Number(raw) : raw
    return {
      question_key: r.question_key,
      answer: { response: coerced }
    }
  })

  const engineResult = calculateNeuroLoad(engineInput, neuroLensAnswer)

  // ============================================================
  // DESTRUCTURE ENGINE RESULT
  //
  // FIX: blendApplied and thresholdDifferential live inside
  // sensoryProfile — not at the top level of the engine return.
  // Previous destructure pattern silently returned undefined for both.
  // ============================================================
  const {
    rawIndices,
    percentIndices,
    finalNeuroLoad,
    systemState,
    priorityDomains,
    recoveryModifier,
    sensoryProfile,
    integrationProfile,
    energyTaxBaseline,
    primaryStrain,
    interactionFlags
  } = engineResult

  // Correctly scoped from sensoryProfile
  const { blendApplied, thresholdDifferential } = sensoryProfile

  // Integration profile fields
  const {
    integrationIndex,
    integrationPattern,
    profileDescriptor
  } = integrationProfile

  // MAP TO DASHBOARD PROFILE
  const profile     = mapEngineToDashboard(sensoryProfile)
  const displayName = getProfileDisplayName(profile)
  const recoveryLabel = RECOVERY_MODIFIER_LABELS[recoveryModifier] ?? 'Neutral'
  const integrationLabel    = INTEGRATION_PATTERN_LABELS[integrationPattern]    ?? 'Variable'
  const integrationSubtitle = INTEGRATION_PATTERN_SUBTITLES[integrationPattern] ?? ''

  // ============================================================
  // CONFIGURE UI DOMAINS
  // ============================================================
  const domains = [
    {
      id: 'cii',
      name: 'Circadian Rhythm',
      score: rawIndices.cii,
      max: 25,
      description: profile === 'seeker'
        ? 'Capacity to maintain wakefulness without caffeine spikes.'
        : 'Alignment with biological day/night rhythm.',
      status: percentIndices.cii <= 40 ? 'Regulated' : percentIndices.cii <= 65 ? 'Drifting' : 'Dysregulated',
      icon: <Zap size={24} className={percentIndices.cii > 65 ? "text-[#b5a642]" : "text-[#b5a642]"} />
    },
    {
      id: 'ali',
      name: 'Autonomic Load',
      score: rawIndices.ali,
      max: 25,
      // FIX: accumulativeALIFlag surfaces a note that mid-range ALI
      // is more serious for accumulative profiles — added below in render.
      description: profile === 'sensor'
        ? 'Background vigilance caused by sensory friction.'
        : 'Nervous system activation and stress axis load.',
      status: percentIndices.ali <= 40 ? 'Stable' : percentIndices.ali <= 65 ? 'Activated' : 'High Vigilance',
      icon: <Activity size={24} className="text-[#b5a642]" />
    },
    {
      id: 'pli',
      name: 'Predictive Legibility',
      score: rawIndices.pli,
      max: 25,
      description: profile === 'seeker'
        ? 'Are your visual cues working or disappearing?'
        : 'Spatial clarity and cognitive friction.',
      status: percentIndices.pli <= 40 ? 'Legible' : percentIndices.pli <= 65 ? 'Frictional' : 'Fragmented',
      icon: <Brain size={24} className="text-[#b5a642]" />
    },
    {
      id: 'stl',
      name: 'Sensory Load',
      score: rawIndices.stl,
      max: 35,
      description: profile === 'sensor'
        ? 'Pain-point triggers: Glare, Echo, Texture.'
        : profile === 'seeker'
          ? 'Under-stimulation vs. Distraction balance.'
          : 'Cumulative impact of noise, clutter, and texture.',
      status: percentIndices.stl <= 40 ? 'Optimized' : percentIndices.stl <= 65 ? 'Moderate' : 'Overload',
      icon: <ShieldAlert size={24} className="text-[#b5a642]" />
    },
    {
      id: 'rci',
      name: 'Recovery Potential',
      score: rawIndices.rci,
      max: 35,
      description: profile === 'seeker'
        ? 'Ability of the home to provide active regulation (movement).'
        : 'Capacity of the home to support parasympathetic restoration (calm).',
      status: percentIndices.rci <= 40 ? 'Strong' : percentIndices.rci <= 65 ? 'Moderate' : 'Compromised',
      icon: <CheckCircle size={24} className="text-[#b5a642]" />
    }
  ]

  const criticalIssues = priorityDomains
    .map(p => domains.find(d => d.id === p.id))
    .filter(Boolean) as typeof domains

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-[#1b270e] font-sans selection:bg-[#b5a642] selection:text-[#1b270e]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen p-6 md:p-12">

        <Link
          href="/dashboard"
          className="flex items-center text-[#c9ccbb]/60 hover:text-[#b5a642] mb-8 transition-colors w-fit"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <div className="max-w-4xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-serif text-[#c9ccbb] mb-2">
                Your NeuroLoad Overview
              </h1>
              <p className="text-[#c9ccbb]/70">
                Your home, calibrated for <strong>{displayName}</strong>.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <OrbitalBadge profile={profile} />
            </div>
          </div>

          {/* EXECUTIVE SUMMARY */}
          <div className="glass-panel p-8 md:p-12 rounded-3xl mb-8 border-l-8 border-[#b5a642] relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">
                Current System State
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">
                {systemState}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-[#c9ccbb]/10">
                <div>
                  <div className="text-3xl font-bold text-[#c9ccbb]">
                    {finalNeuroLoad}
                    <span className="text-base text-[#c9ccbb]/80 font-normal">/100</span>
                  </div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                    NeuroLoad Score™
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-[#c9ccbb]">
                    {criticalIssues.length}
                  </div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                    Priority Areas
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-[#c9ccbb]">
                    {recoveryLabel}
                  </div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                    Recovery Modifier
                  </div>
                </div>

                {/* NEW: Integration pattern summary stat */}
                <div>
                  <div className="text-3xl font-bold text-[#c9ccbb]">
                    {integrationLabel}
                  </div>
                  <div className="text-xs text-[#c9ccbb]/80 uppercase tracking-widest mt-1">
                    Processing Pattern
                  </div>
                </div>
              </div>

              {/* BLEND TRANSPARENCY — only shown when tiebreak fired.
                  Correctly reads from sensoryProfile now, not top-level destructure. */}
              {blendApplied && (
                <div className="mt-6 pt-6 border-t border-[#c9ccbb]/10">
                  <p className="text-[#c9ccbb]/40 text-xs leading-relaxed">
                    Your sensory profile was resolved using your neurotype as a tiebreaker.
                    Scale responses were within {thresholdDifferential} points — within the ambiguity
                    threshold. Your next assessment cycle will refine this further.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* PROFILE DESCRIPTOR — the six-profile plain-language card   */}
          {/* This is the most significant new UI element. It surfaces   */}
          {/* the user's combined threshold + integration profile in      */}
          {/* accurate, non-clinical language.                            */}
          {/* --------------------------------------------------------- */}
          <div className="mb-12 p-8 rounded-3xl border border-[#b5a642]/20 bg-[#b5a642]/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at top left, #b5a642 0%, transparent 70%)' }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                  Your Sensory Processing Profile
                </span>
                {/* Integration pattern badge */}
                <span className="px-2.5 py-1 rounded-full border border-[#b5a642]/40 bg-[#b5a642]/10 text-[#b5a642] text-[10px] font-bold uppercase tracking-widest">
                  {integrationLabel} Pattern
                </span>
              </div>

              {/* Profile descriptor — the six-profile plain-language description */}
              <p className="text-[#c9ccbb] text-base leading-relaxed mb-4">
                {profileDescriptor}
              </p>

              {/* Integration pattern subtitle */}
              <p className="text-[#c9ccbb]/50 text-xs leading-relaxed border-t border-[#b5a642]/10 pt-4">
                {integrationSubtitle}
              </p>

              {/* Integration Index — shown as a subtle metric */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1 bg-[#000]/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#b5a642]/60 rounded-full transition-all duration-1000"
                    style={{ width: `${integrationIndex}%` }}
                  />
                </div>
                <span className="text-[#c9ccbb]/40 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Integration Index: {integrationIndex}/100
                </span>
              </div>
            </div>
          </div>

          {/* ACCUMULATIVE ALI FLAG — surfaces when mid-range ALI is more
              serious than it appears due to accumulative processing pattern */}
          {interactionFlags.accumulativeALIFlag && (
            <div className="mb-8 p-5 rounded-2xl border border-[#b5a642]/30 bg-[#b5a642]/5 flex items-start gap-3">
              <AlertCircle size={16} className="text-[#b5a642] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#b5a642] text-[10px] font-bold uppercase tracking-widest block mb-1">
                  Autonomic Load — Context Note
                </span>
                <p className="text-[#c9ccbb]/70 text-xs leading-relaxed">
                  Your Autonomic Load score appears moderate, but your accumulative processing pattern means 
                  your nervous system is carrying more than this score alone suggests. A system that does not 
                  fully clear between exposures has a higher effective load than the number reflects. 
                  Your priority actions reflect this.
                </p>
              </div>
            </div>
          )}

          {/* PRIORITY FOCUS AREAS */}
          {criticalIssues.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">
                Your Priority Actions
              </h3>
              <PriorityList
                areas={criticalIssues}
                profile={profile}
                integrationPattern={integrationPattern}
              />
            </div>
          )}

          {/* DETAILED ANALYSIS */}
          <div className="mb-16">
            <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">
              Detailed Analysis
            </h3>
            <HumanScorecard
              scores={{
                circadian:  percentIndices.cii,
                autonomic:  percentIndices.ali,
                legibility: percentIndices.pli,
                sensory:    percentIndices.stl,
                recovery:   percentIndices.rci
              }}
              profile={profile}
              integrationPattern={integrationPattern}
              accumulativeALIFlag={interactionFlags.accumulativeALIFlag}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
