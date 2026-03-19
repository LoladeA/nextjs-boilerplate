// =============================================================================
// FILE: app/api/submit-update-assessment/route.ts
// =============================================================================
//
// SERVER-SIDE HANDLER — Update Assessment Submission
//
// ARCHITECTURE NOTE (this version):
//
//   The update assessment no longer uses comparative/delta questions.
//   All 15 domain questions are present-tense mirrors of the onboarding
//   assessment. The delta is computed by the engine from two snapshots —
//   not reported by the user.
//
//   INCOMING PAYLOAD STRUCTURE:
//     Domain questions:  q5, q6, q7, q10, q11, q12, q15, q17, q19,
//                        q20, q21, q24, q28, q29, q33
//     Snapshot context:  q_state, energy_tax, primary_strain
//     Change detection:  env_change_sleep, env_change_day, life_context_change
//     Subjective marker: subjective_alignment_score
//
//   CHANGE LOG (this version):
//
//   1. snapshot_type query fixed: 'baseline' → 'initial' to match the
//      migration backfill. The route previously returned 400 for all users
//      because the query never matched.
//
//   2. extractAnchorResponses / extractDeltaFields removed. These separated
//      comparative delta keys that no longer exist in the payload. Replaced
//      with CONTEXT_KEYS — a simple set that separates non-domain context
//      fields from the scoreable domain questions.
//
//   3. formattedDeltaFields no longer populates cii_delta_self etc. Domain
//      deltas are computed by calculateBaselineDelta from the two snapshot
//      objects directly. Context fields (change detection, subjective score)
//      are the only delta fields now passed explicitly.
//
//   4. assessment_cycle: 2 written on all upserted user_responses rows so
//      the DB can distinguish update responses from onboarding responses
//      using the same question key.
//
//   5. previous_snapshot_id stamped on the new snapshot row, creating an
//      explicit FK link to the baseline being compared against.
//
//   NUMERIC CASTING:
//   All numeric question keys cast to Number() before the scoring engine.
//   String values from Supabase produce NaN silently — breaking domain
//   scores and the Integration Index.
//
// =============================================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'
import { calculateBaselineDelta } from '@/app/lib/baseline-delta-engine'

// ─────────────────────────────────────────────────────────────────────────────
// NUMERIC KEYS
// All of these must be cast to Number() before reaching the scoring engine.
// String values from Supabase produce NaN — silently breaking domain scores.
// ─────────────────────────────────────────────────────────────────────────────
const NUMERIC_KEYS = new Set([
  'energy_tax',
  'q_int1', 'q_int2', 'q_int3',
  'q5',  'q6',  'q7',  'q8',  'q9',
  'q10', 'q11', 'q12', 'q13', 'q14',
  'q15', 'q16', 'q17', 'q18', 'q19',
  'q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26',
  'q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33'
])

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT KEYS
// These keys carry contextual metadata — they are not scored by the engine.
// They are separated from domain questions and stored directly on the snapshot.
// ─────────────────────────────────────────────────────────────────────────────
const CONTEXT_KEYS = new Set([
  'env_change_sleep',
  'env_change_day',
  'life_context_change',
  'subjective_alignment_score',
])

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // -----------------------------------------------------------------------
    // STEP 1 — AUTHENTICATE
    // -----------------------------------------------------------------------

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // -----------------------------------------------------------------------
    // STEP 2 — PARSE INCOMING RESPONSES
    // Format: { responses: [{ question_key: string, answer: { response: any } }] }
    // -----------------------------------------------------------------------

    const body = await request.json()
    const allResponses: { question_key: string; answer: { response: any } }[] = body.responses

    if (!allResponses || allResponses.length === 0) {
      return NextResponse.json({ error: 'No responses provided' }, { status: 400 })
    }

    // -----------------------------------------------------------------------
    // STEP 3 — SEPARATE DOMAIN RESPONSES FROM CONTEXT FIELDS
    //
    // Domain responses → merged with existing responses → scoring engine
    // Context fields   → stored directly on the snapshot record
    // -----------------------------------------------------------------------

    const domainResponses = allResponses.filter(r => !CONTEXT_KEYS.has(r.question_key))
    const contextFields   = Object.fromEntries(
      allResponses
        .filter(r => CONTEXT_KEYS.has(r.question_key))
        .map(r => [r.question_key, r.answer.response])
    )

    // -----------------------------------------------------------------------
    // STEP 4 — FETCH THE MOST RECENT INITIAL SNAPSHOT (BASELINE)
    //
    // FIX: was querying snapshot_type = 'baseline' — corrected to 'initial'
    // to match the migration backfill applied to all existing snapshots.
    //
    // We take the most recent 'initial' snapshot as the baseline, not the
    // earliest — a user may have reset and restarted their assessment cycle.
    // -----------------------------------------------------------------------

    const { data: baselineSnapshot, error: snapshotError } = await supabase
      .from('assessment_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('snapshot_type', 'initial')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (snapshotError || !baselineSnapshot) {
      return NextResponse.json(
        { error: 'No initial assessment found. Please complete the full assessment first.' },
        { status: 400 }
      )
    }

    // -----------------------------------------------------------------------
    // STEP 5 — FETCH ALL CURRENT RESPONSES FROM THE VIEW
    // -----------------------------------------------------------------------

    const { data: currentResponses, error: responsesError } = await supabase
      .from('current_user_responses')
      .select('*')
      .eq('user_id', user.id)

    if (responsesError || !currentResponses || currentResponses.length === 0) {
      return NextResponse.json({ error: 'Could not fetch current responses' }, { status: 400 })
    }

    // -----------------------------------------------------------------------
    // STEP 6 — MERGE DOMAIN RESPONSES INTO CURRENT RESPONSES
    //
    // Existing responses form the base map. New domain responses overwrite
    // any matching key. Numeric keys are cast to Number() at both stages.
    // -----------------------------------------------------------------------

    const currentMap = new Map(
      currentResponses.map((r: any) => [
        r.question_key,
        {
          question_key: r.question_key,
          answer: {
            response: NUMERIC_KEYS.has(r.question_key)
              ? Number(r.answer_value)
              : r.answer_value
          }
        }
      ])
    )

    domainResponses.forEach(r => {
      currentMap.set(r.question_key, {
        question_key: r.question_key,
        answer: {
          response: NUMERIC_KEYS.has(r.question_key)
            ? Number(r.answer.response)
            : r.answer.response
        }
      })
    })

    const mergedResponses = Array.from(currentMap.values())

    // -----------------------------------------------------------------------
    // STEP 7 — RUN THE SCORING ENGINE ON MERGED RESPONSES
    // -----------------------------------------------------------------------

    const neuroLensRaw = currentMap.get('neuro_lens')?.answer?.response || 'None'
    const updateResult = calculateNeuroLoad(mergedResponses, neuroLensRaw)

    // -----------------------------------------------------------------------
    // STEP 8 — RECONSTRUCT BASELINE NEUROLOADRESULT
    //
    // integrationProfile included so the delta engine can detect integration
    // axis shifts (integrative → accumulative etc.).
    //
    // Fallback: baseline snapshots written before integration columns were
    // added will have integration_pattern = NULL. The delta engine handles
    // undefined gracefully — integration_pattern_change will be false for
    // that comparison and corrects itself on the next update assessment.
    // -----------------------------------------------------------------------

    const baselineResult = {
      rawIndices:      { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 },
      percentIndices:  {
        cii: baselineSnapshot.cii,
        ali: baselineSnapshot.ali,
        pli: baselineSnapshot.pli,
        stl: baselineSnapshot.stl,
        rci: baselineSnapshot.rci
      },
      weightedIndices:  { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 },
      finalNeuroLoad:   baselineSnapshot.neuro_load,
      systemState:      baselineSnapshot.system_state,
      interactionFlags: {
        restorativeDeficit:    false,
        sensoryHypervigilance: false,
        cognitiveStrain:       false
      },
      priorityDomains:  [],
      recoveryModifier: 'neutral' as const,
      sensoryProfile: {
        threshold:             'low' as const,
        regulation:            'passive' as const,
        pattern:               (baselineSnapshot.sensory_pattern || 'sensitive') as any,
        blendApplied:          false,
        thresholdDifferential: 0
      },
      integrationProfile: baselineSnapshot.integration_pattern
        ? {
            integrationPattern: baselineSnapshot.integration_pattern as 'integrative' | 'mixed' | 'accumulative',
            integrationIndex:   baselineSnapshot.integration_index ?? 50,
            profileDescriptor:  ''
          }
        : undefined,
      energyTaxBaseline: baselineSnapshot.energy_tax,
      primaryStrain:     'None of the above'
    }

    // -----------------------------------------------------------------------
    // STEP 9 — CALCULATE THE DELTA
    //
    // Domain deltas are computed by calculateBaselineDelta from the two
    // snapshot objects directly — not from user-reported comparative scores.
    //
    // Context fields passed separately:
    //   - env_change_sleep, env_change_day, life_context_change — provide
    //     the delta engine with context for interpreting score changes
    //   - subjective_alignment_score — the gut-response felt-sense marker,
    //     stored on the snapshot and surfaced in the results page
    // -----------------------------------------------------------------------

    const contextForDelta = {
      subjective_alignment_score: Number(contextFields.subjective_alignment_score) || 3,
      env_change_sleep:           contextFields.env_change_sleep    || [],
      env_change_day:             contextFields.env_change_day      || [],
      life_context_change:        contextFields.life_context_change  || [],
    }

    const deltaReport = calculateBaselineDelta(
      baselineResult as any,
      updateResult,
      baselineSnapshot.id,
      'pending',
      contextForDelta
    )

    // -----------------------------------------------------------------------
    // STEP 10 — UPSERT DOMAIN RESPONSES INTO user_responses
    //
    // assessment_cycle: 2 written on all rows so the DB can distinguish
    // update responses from onboarding responses sharing the same key.
    // -----------------------------------------------------------------------

    const upsertRows = domainResponses.map(r => ({
      user_id:          user.id,
      question_key:     r.question_key,
      answer:           { response: r.answer.response },
      assessment_cycle: 2,
    }))

    const { error: upsertError } = await supabase
      .from('user_responses')
      .upsert(upsertRows, { onConflict: 'user_id, question_key' })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json({ error: 'Failed to update responses' }, { status: 500 })
    }

    // -----------------------------------------------------------------------
    // STEP 11 — WRITE UPDATE SNAPSHOT TO assessment_snapshots
    //
    // previous_snapshot_id stamped explicitly — creates a clean FK link
    // to the baseline being compared against. Eliminates ambiguity on
    // subsequent update assessments.
    //
    // subjective_alignment_score stored directly on the snapshot row —
    // it is a trajectory marker, not a domain question.
    //
    // Change detection arrays stored as JSONB for the results page.
    // -----------------------------------------------------------------------

    const { data: newSnapshot, error: snapshotInsertError } = await supabase
      .from('assessment_snapshots')
      .insert({
        user_id:                    user.id,
        snapshot_type:              'update',
        previous_snapshot_id:       baselineSnapshot.id,
        neuro_load:                 updateResult.finalNeuroLoad,
        cii:                        Math.round(updateResult.percentIndices.cii),
        ali:                        Math.round(updateResult.percentIndices.ali),
        pli:                        Math.round(updateResult.percentIndices.pli),
        stl:                        Math.round(updateResult.percentIndices.stl),
        rci:                        Math.round(updateResult.percentIndices.rci),
        energy_tax:                 updateResult.energyTaxBaseline,
        system_state:               updateResult.systemState,
        sensory_pattern:            updateResult.sensoryProfile.pattern,
        integration_pattern:        updateResult.integrationProfile?.integrationPattern ?? null,
        integration_index:          updateResult.integrationProfile?.integrationIndex   ?? null,
        // Context fields from Part 2 and Part 3 of the update assessment
        subjective_alignment_score: contextForDelta.subjective_alignment_score,
        env_change_sleep:           contextForDelta.env_change_sleep,
        env_change_day:             contextForDelta.env_change_day,
        life_context_change:        contextForDelta.life_context_change,
      })
      .select()
      .single()

    if (snapshotInsertError || !newSnapshot) {
      console.error('Snapshot insert error:', snapshotInsertError)
      return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
    }

    // -----------------------------------------------------------------------
    // STEP 12 — STORE DELTA REPORT ON THE SNAPSHOT
    // Stored as JSONB so the results page fetches everything in one query.
    // -----------------------------------------------------------------------

    const finalDeltaReport = {
      ...deltaReport,
      update_id: newSnapshot.id
    }

    await supabase
      .from('assessment_snapshots')
      .update({ delta_report: finalDeltaReport })
      .eq('id', newSnapshot.id)

    // -----------------------------------------------------------------------
    // STEP 13 — RETURN TO CLIENT
    // -----------------------------------------------------------------------

    return NextResponse.json({
      success:                    true,
      snapshot_id:                newSnapshot.id,
      neuro_load:                 updateResult.finalNeuroLoad,
      system_state:               updateResult.systemState,
      load_delta:                 deltaReport.load_delta,
      load_direction:             deltaReport.load_direction,
      overall_progress:           deltaReport.overall_progress,
      integration_pattern_change: deltaReport.integration_pattern_change,
      integration_pattern_shift:  deltaReport.integration_pattern_shift,
    })

  } catch (err) {
    console.error('Submit update assessment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
