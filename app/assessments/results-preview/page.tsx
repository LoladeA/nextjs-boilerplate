'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowRight, Zap } from 'lucide-react'
import { getGuestData } from '../../utils/guest-storage'
import { calculateNeuroLoad } from '../../utils/scoring-engine'
import { mapEngineToDashboard, getProfileDisplayName } from '@/app/lib/neuro-mapper'
import HumanScorecard from '../../components/HumanScorecard'
import PriorityList from '../report/PriorityList'

// ============================================================
// RECOVERY MODIFIER — display labels
// Matches AssessmentReport exactly so guest and member reports
// use identical vocabulary. Eliminates the getStatus() mismatch.
// ============================================================
const RECOVERY_MODIFIER_LABELS: Record<string, string> = {
  protective:  'Protective',
  compounding: 'Compounding',
  neutral:     'Neutral'
}

// ============================================================
// PROFILE-AWARE FALLBACK DOMAINS
// Used when priorityDomains is empty (all scores below
// interaction threshold). Returns the most clinically
// significant domain per archetype rather than hardcoding 'ali'.
//
//   sensor → stl  Sensory load is the primary sensor burden
//   seeker → pli  Legibility is the primary seeker friction
//   anchor → rci  Recovery is where anchors are most under-served
// ============================================================
const PROFILE_FALLBACK_DOMAIN: Record<string, string> = {
  sensor: 'stl',
  seeker: 'pli',
  anchor: 'rci'
}

export default function ResultsPreview() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Initialise as null — prevents flash of 'anchor' content before engine runs.
  // Loading state covers the gap; profile is only used after setData fires.
  const [profile, setProfile] = useState<string | null>(null)

  useEffect(() => {
    const guestData = getGuestData()
    if (!guestData || Object.keys(guestData.answers).length === 0) {
      router.push('/assessments/step0')
      return
    }

    const formattedResponses = Object.entries(guestData.answers).map(([key, value]) => ({
      question_key: key,
      answer: { response: value }
    }))

    const neuroLens = guestData.answers['neuro_lens'] || 'None'
    const result = calculateNeuroLoad(formattedResponses, neuroLens)
    const dashboardProfile = mapEngineToDashboard(result.sensoryProfile)

    setProfile(dashboardProfile)
    setData(result)
    setLoading(false)
  }, [router])

  if (loading || !profile) return (
    <div className="min-h-screen bg-[#1b270e] flex flex-col items-center justify-center text-[#b5a642]">
      <Zap className="animate-pulse mb-4" size={48} />
      <span className="font-serif text-xl">Analysing Sensory Profile...</span>
    </div>
  )

  // ============================================================
  // DESTRUCTURE ENGINE RESULT
  // All fields extracted — Part 0 data retained rather than discarded.
  // energyTaxBaseline + primaryStrain available for future guest
  // sign-up incentive copy ("Your energy tax is X%").
  // blendApplied + thresholdDifferential available if blend transparency
  // is surfaced on the guest page in a future iteration.
  // ============================================================
  const {
    finalNeuroLoad,
    systemState,
    rawIndices,
    percentIndices,
    priorityDomains,
    recoveryModifier,
    energyTaxBaseline,
    primaryStrain,
    blendApplied,
    thresholdDifferential
  } = data

  // FIX: recoveryLabel replaces getStatus(rawIndices.rci).
  // getStatus() was inverted — lower raw RCI score was labelled
  // 'High Potential' but rawIndices.rci = 10 represents 71% friction.
  // recoveryModifier from the engine is correctly directional.
  const recoveryLabel = RECOVERY_MODIFIER_LABELS[recoveryModifier] ?? 'Neutral'

  // FIX: display name from derived profile — not raw neurotype.
  // Subtitle becomes: "Your home, calibrated for The Sensor."
  // Creates continuity with the full report and names the archetype
  // before the sign-up gate — strongest conversion hook on the page.
  const displayName = getProfileDisplayName(profile)

  // Priority areas — id only, which is all PriorityList needs.
  // FIX: profile-aware fallback replaces hardcoded [{id: 'ali'}].
  const priorityIDs = priorityDomains.map((d: any) => ({ id: d.id }))
  const fallbackDomain = PROFILE_FALLBACK_DOMAIN[profile] ?? 'rci'
  const priorityAreas = priorityIDs.length > 0 ? priorityIDs : [{ id: fallbackDomain }]

  return (
    <div className="min-h-screen bg-[#1b270e] font-sans text-[#c9ccbb] pb-32">

      {/* HEADER */}
      <div className="p-6 md:p-12 border-b border-[#c9ccbb]/10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#b5a642] rounded-full" />
            <span className="font-serif text-xl tracking-wide">TheSentientHome</span>
          </div>
          <Link
            href="/login"
            className="text-xs uppercase tracking-widest text-[#c9ccbb]/40 hover:text-[#b5a642]"
          >
            Member Login
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">

        {/* PAGE TITLE */}
        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-serif text-[#c9ccbb] mb-2">
            Your NeuroLoad Overview
          </h1>
          {/* FIX: profile name in subtitle — same wording as full report.
              Naming the archetype here is the primary conversion hook.
              Guest sees "The Sensor" before the sign-up gate. */}
          <p className="text-[#c9ccbb]/60">
            Your home, calibrated for <strong className="text-[#c9ccbb]">{displayName}</strong>.
          </p>
        </div>

        {/* SCORE CARD */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl mb-12 border-l-8 border-[#b5a642] relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[#b5a642] text-xs font-bold uppercase tracking-widest mb-2 block">
              Current Nervous System State
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#c9ccbb] mb-6">
              {systemState}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#c9ccbb]/10">
              <div>
                <div className="text-4xl font-bold text-[#c9ccbb]">
                  {finalNeuroLoad}
                  <span className="text-base text-[#c9ccbb]/60 font-normal">/100</span>
                </div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">
                  NeuroLoad Score™
                </div>
              </div>

              <div>
                <div className="text-4xl font-bold text-[#c9ccbb]">
                  {priorityAreas.length}
                </div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">
                  Areas Needing Support
                </div>
              </div>

              <div>
                {/* FIX: recoveryLabel replaces getStatus(rawIndices.rci).
                    getStatus was inverted and used different vocabulary.
                    Now matches AssessmentReport exactly. */}
                <div className="text-2xl md:text-3xl font-bold text-[#c9ccbb]">
                  {recoveryLabel}
                </div>
                <div className="text-xs text-[#c9ccbb]/60 uppercase tracking-widest mt-1">
                  Recovery Modifier
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-[#b5a642] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
        </div>

        {/* PRIORITY ACTIONS — visible to guests */}
        <div className="mb-16">
          <h3 className="text-2xl font-serif text-[#c9ccbb] mb-8">Your Priority Actions</h3>
          {/* PriorityList only needs {id} — resolves all content internally.
              FIX: profile-aware fallback replaces hardcoded [{id: 'ali'}] */}
          <PriorityList areas={priorityAreas} profile={profile} />
        </div>

        {/* DETAILED ANALYSIS — locked for guests */}
        <div className="relative">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-2xl font-serif text-[#c9ccbb]">Detailed Analysis</h3>
            <div className="flex items-center gap-2 text-[#b5a642] text-xs font-bold uppercase tracking-widest">
              <Lock size={14} /> Locked for Guests
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden">
            <div className="filter blur-md opacity-40 pointer-events-none select-none">
              <HumanScorecard
                scores={{
                  circadian:  percentIndices.cii,
                  autonomic:  percentIndices.ali,
                  legibility: percentIndices.pli,
                  sensory:    percentIndices.stl,
                  recovery:   percentIndices.rci
                }}
                profile={profile}
              />
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-[#1b270e] via-[#1b270e]/80 to-transparent">
              <div className="max-w-md p-8 rounded-2xl bg-[#1b270e]/90 border border-[#b5a642]/30 shadow-2xl backdrop-blur-xl">
                <div className="w-12 h-12 rounded-full bg-[#b5a642]/20 text-[#b5a642] flex items-center justify-center mb-4 mx-auto border border-[#b5a642]/30">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-serif text-[#c9ccbb] mb-3">See Your Full Diagnosis</h3>
                <p className="text-sm text-[#c9ccbb]/70 mb-8 leading-relaxed">
                  Create a free account to unlock your detailed sensory breakdown and save your progress.
                </p>
                <Link
                  href="/login?view=signup"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[#b5a642] text-[#1b270e] font-bold rounded-xl hover:bg-[#d4c55e] transition-all shadow-lg shadow-[#b5a642]/20"
                >
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <p className="text-[10px] text-[#c9ccbb]/40 mt-4 uppercase tracking-widest">
                  Already have an account?{' '}
                  <Link href="/login" className="text-[#b5a642] hover:underline">Log In</Link>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1b270e] border-t border-[#b5a642]/20 p-4 z-50">
        <Link
          href="/login?view=signup"
          className="w-full py-3 bg-[#b5a642] text-[#1b270e] font-bold rounded-lg hover:bg-[#d4c55e] transition-all text-center flex items-center justify-center gap-2"
        >
          Save Results & Unlock
        </Link>
      </div>

    </div>
  )
}

// ============================================================
// GUEST DATA TRANSFER — sign-up handler integration
// ============================================================
//
// STATUS: UNVERIFIED — confirm whether your auth callback already
// calls this before wiring it in.
//
// The problem: guest answers live in guest-storage (localStorage).
// After account creation, if nothing transfers them, the user lands
// on an empty report page. This is the highest conversion-to-retention
// risk in the entire guest flow.
//
// HOW TO WIRE IT:
// In your sign-up success handler (auth callback or onAuthStateChange),
// call transferGuestDataToAccount(userId) immediately after the session
// is confirmed. The function reads guest-storage, writes to user_responses
// via the Supabase client, then clears guest-storage.
//
// If your auth callback is in /app/auth/callback/route.ts, add:
//   import { transferGuestDataToAccount } from '@/app/utils/guest-transfer'
//   await transferGuestDataToAccount(session.user.id)
// after session confirmation and before redirect.
//
// ============================================================

// @/app/utils/guest-transfer.ts
// ============================================================
// import { getGuestData, clearGuestData } from './guest-storage'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
//
// export async function transferGuestDataToAccount(userId: string): Promise<void> {
//   const guestData = getGuestData()
//   if (!guestData || Object.keys(guestData.answers).length === 0) return
//
//   const supabase = createClientComponentClient()
//
//   // Build rows matching user_responses schema
//   const rows = Object.entries(guestData.answers).map(([question_key, answer_value]) => ({
//     user_id:      userId,
//     question_key,
//     answer_value: String(answer_value),
//     // version_id: supply your current assessment version id if required
//   }))
//
//   // Upsert — safe to call even if a partial transfer already ran
//   const { error } = await supabase
//     .from('user_responses')
//     .upsert(rows, { onConflict: 'user_id, question_key' })
//
//   if (error) {
//     console.error('[guest-transfer] Failed to transfer guest data:', error.message)
//     return
//   }
//
//   // Only clear guest storage after confirmed write
//   clearGuestData()
// }
