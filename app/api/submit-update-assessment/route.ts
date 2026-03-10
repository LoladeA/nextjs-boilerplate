// =============================================================================
// FILE: app/api/submit-update-assessment/route.ts
// =============================================================================
//
// SERVER-SIDE HANDLER — Update Assessment Submission
//
// CHANGE LOG (this version):
//
//   NUMERIC CASTING (Step 7)
//   All numeric question keys now cast to Number() before being passed to
//   the scoring engine. Previously, values read from current_user_responses
//   arrived as strings from Supabase and were passed to the engine uncasted.
//   q_int1, q_int2, q_int3 added to NUMERIC_KEYS — without this, the
//   Integration Index produces NaN and every user defaults to 'integrative'.
//
//   BASELINE RECONSTRUCTION (Step 8)
//   integrationProfile added to the reconstructed baseline NeuroLoadResult.
//   The delta engine reads baselineResult.integrationProfile?.integrationPattern
//   to detect integration axis shifts between assessments. Without this,
//   integration_pattern_change was always false regardless of what shifted.
//   Falls back gracefully when the baseline snapshot pre-dates the new columns
//   (integration_pattern = NULL) — existing users are unaffected.
//
//   SNAPSHOT INSERT (Step 11)
//   integration_pattern and integration_index now written to the snapshot row.
//   Required for the delta engine to detect integration axis changes on
//   subsequent update assessments.
//
// =============================================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'
import { extractAnchorResponses, extractDeltaFields } from '@/app/lib/update-assessment-protocol'
import { calculateBaselineDelta } from '@/app/lib/baseline-delta-engine'

// Keys whose answer_value must be cast to Number before reaching the engine.
// String values produce NaN in the scoring engine — silently breaking
// domain scores and the Integration Index.
const NUMERIC_KEYS = new Set([
  'energy_tax',
  'q_int1', 'q_int2', 'q_int3',
  'q5','q6','q7','q8','q9',
  'q10','q11','q12','q13','q14',
  'q15','q16','q17','q18','q19',
  'q20','q21','q22','q23','q24','q25','q26',
  'q27','q28','q29','q30','q31','q32','q33'
])

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // -------------------------------------------------------
    // STEP 1 — AUTHENTICATE
    // -------------------------------------------------------

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 401 }
      )
    }

    // -------------------------------------------------------
    // STEP 2 — PARSE INCOMING RESPONSES
    // Format expected from the update form:
    //   { responses: [{ question_key: string, answer: { response: any } }] }
    // -------------------------------------------------------

    const body = await request.json()
    const allResponses: { question_key: string; answer: { response: any } }[] = body.responses

    if (!allResponses || allResponses.length === 0) {
      return NextResponse.json(
        { error: 'No responses provided' },
        { status: 400 }
      )
    }

    // -------------------------------------------------------
    // STEP 3 — SEPARATE ANCHOR RESPONSES FROM DELTA FIELDS
    // Anchor responses → go to scoring engine + current_user_responses
    // Delta fields     → stored directly on the snapshot record
    // -------------------------------------------------------

    const anchorResponses = extractAnchorResponses(allResponses)
    const deltaFields     = extractDeltaFields(allResponses)

    // -------------------------------------------------------
    // STEP 4 — FETCH CURRENT BASELINE SNAPSHOT
    // -------------------------------------------------------

    const { data: baselineSnapshot, error: snapshotError } = await supabase
      .from('assessment_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .eq('snapshot_type', 'baseline')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (snapshotError || !baselineSnapshot) {
      return NextResponse.json(
        { error: 'No baseline snapshot found. Please complete the full assessment first.' },
        { status: 400 }
      )
    }

    // -------------------------------------------------------
    // STEP 5 — FETCH ALL CURRENT RESPONSES
    // -------------------------------------------------------

    const { data: currentResponses, error: responsesError } = await supabase
      .from('current_user_responses')
      .select('*')
      .eq('user_id', user.id)

    if (responsesError || !currentResponses || currentResponses.length === 0) {
      return NextResponse.json(
        { error: 'Could not fetch current responses' },
        { status: 400 }
      )
    }

    // -------------------------------------------------------
    // STEP 6 — MERGE ANCHOR RESPONSES INTO CURRENT RESPONSES
    // Values from Supabase arrive as strings. Cast numeric keys
    // here so the engine always receives the correct type.
    // -------------------------------------------------------

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

    // Overwrite with new anchor values, applying the same numeric cast
    anchorResponses.forEach(r => {
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

    // -------------------------------------------------------
    // STEP 7 — RUN THE SCORING ENGINE ON MERGED RESPONSES
    // -------------------------------------------------------

    const neuroLensRaw = currentMap.get('neuro_lens')?.answer?.response || 'None'

    const updateResult = calculateNeuroLoad(mergedResponses, neuroLensRaw)

    // -------------------------------------------------------
    // STEP 8 — RECONSTRUCT BASELINE NEUROLOADRESULT
    //
    // integrationProfile is included so the delta engine can detect
    // integration axis shifts (integrative → accumulative etc.).
    //
    // Fallback: baseline snapshots written before the integration columns
    // were added will have integration_pattern = NULL. In that case we
    // omit integrationProfile entirely — the delta engine handles undefined
    // gracefully and integration_pattern_change will be false for that
    // comparison only. Corrects itself on the next update assessment once
    // a proper snapshot with integration data exists.
    // -------------------------------------------------------

    const baselineResult = {
      rawIndices:      { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 },
      percentIndices:  {
        cii: baselineSnapshot.cii,
        ali: baselineSnapshot.ali,
        pli: baselineSnapshot.pli,
        stl: baselineSnapshot.stl,
        rci: baselineSnapshot.rci
      },
      weightedIndices: { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 },
      finalNeuroLoad:  baselineSnapshot.neuro_load,
      systemState:     baselineSnapshot.system_state,
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
      // Integration profile — populated only when the baseline snapshot has
      // the new columns. NULL-safe: undefined is handled by the delta engine.
      integrationProfile: baselineSnapshot.integration_pattern
        ? {
            integrationPattern:  baselineSnapshot.integration_pattern as 'integrative' | 'mixed' | 'accumulative',
            integrationIndex:    baselineSnapshot.integration_index ?? 50,
            profileDescriptor:   ''
          }
        : undefined,
      energyTaxBaseline: baselineSnapshot.energy_tax,
      primaryStrain:     'None of the above'
    }

    // -------------------------------------------------------
    // STEP 9 — CALCULATE THE DELTA
    // -------------------------------------------------------

    const formattedDeltaFields = {
      cii_delta_self:             Number(deltaFields.cii_delta_self)             || 3,
      ali_delta_self:             Number(deltaFields.ali_delta_self)             || 3,
      pli_delta_self:             Number(deltaFields.pli_delta_self)             || 3,
      stl_delta_self:             Number(deltaFields.stl_delta_self)             || 3,
      rci_delta_self:             Number(deltaFields.rci_delta_self)             || 3,
      subjective_alignment_score: Number(deltaFields.subjective_alignment_score) || 3,
      env_change_sleep:           deltaFields.env_change_sleep                   || [],
      env_change_day:             deltaFields.env_change_day                     || [],
      life_context_change:        deltaFields.life_context_change                || []
    }

    const deltaReport = calculateBaselineDelta(
      baselineResult as any,
      updateResult,
      baselineSnapshot.id,
      'pending',
      formattedDeltaFields
    )

    // -------------------------------------------------------
    // STEP 10 — UPSERT ANCHOR RESPONSES INTO current_user_responses
    // -------------------------------------------------------

    const upsertRows = anchorResponses.map(r => ({
      user_id:      user.id,
      question_key: r.question_key,
      answer:       { response: r.answer.response }
    }))

    const { error: upsertError } = await supabase
      .from('user_responses')
      .upsert(upsertRows, { onConflict: 'user_id, question_key' })

    if (upsertError) {
      console.error('Upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update responses' },
        { status: 500 }
      )
    }

    // -------------------------------------------------------
    // STEP 11 — WRITE UPDATE SNAPSHOT TO assessment_snapshots
    //
    // integration_pattern and integration_index now persisted.
    // These are the values the delta engine will read as the
    // 'baseline' on the next update assessment for this user.
    // -------------------------------------------------------

    const { data: newSnapshot, error: snapshotInsertError } = await supabase
      .from('assessment_snapshots')
      .insert({
        user_id:             user.id,
        snapshot_type:       'update',
        neuro_load:          updateResult.finalNeuroLoad,
        cii:                 Math.round(updateResult.percentIndices.cii),
        ali:                 Math.round(updateResult.percentIndices.ali),
        pli:                 Math.round(updateResult.percentIndices.pli),
        stl:                 Math.round(updateResult.percentIndices.stl),
        rci:                 Math.round(updateResult.percentIndices.rci),
        energy_tax:          updateResult.energyTaxBaseline,
        system_state:        updateResult.systemState,
        sensory_pattern:     updateResult.sensoryProfile.pattern,
        // Integration axis — new columns added in migration
        integration_pattern: updateResult.integrationProfile?.integrationPattern ?? null,
        integration_index:   updateResult.integrationProfile?.integrationIndex   ?? null
      })
      .select()
      .single()

    if (snapshotInsertError || !newSnapshot) {
      console.error('Snapshot insert error:', snapshotInsertError)
      return NextResponse.json(
        { error: 'Failed to save snapshot' },
        { status: 500 }
      )
    }

    // -------------------------------------------------------
    // STEP 12 — STORE DELTA REPORT ON THE SNAPSHOT
    // Stored as JSONB so the results page can fetch everything
    // in a single query. Includes integration_pattern_change
    // and integration_pattern_shift from the updated delta engine.
    // -------------------------------------------------------

    const finalDeltaReport = {
      ...deltaReport,
      update_id: newSnapshot.id
    }

    await supabase
      .from('assessment_snapshots')
      .update({ delta_report: finalDeltaReport })
      .eq('id', newSnapshot.id)

    // -------------------------------------------------------
    // STEP 13 — RETURN TO CLIENT
    // -------------------------------------------------------

    return NextResponse.json({
      success:                    true,
      snapshot_id:                newSnapshot.id,
      neuro_load:                 updateResult.finalNeuroLoad,
      system_state:               updateResult.systemState,
      load_delta:                 deltaReport.load_delta,
      load_direction:             deltaReport.load_direction,
      overall_progress:           deltaReport.overall_progress,
      integration_pattern_change: deltaReport.integration_pattern_change,
      integration_pattern_shift:  deltaReport.integration_pattern_shift
    })

  } catch (err) {
    console.error('Submit update assessment error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
