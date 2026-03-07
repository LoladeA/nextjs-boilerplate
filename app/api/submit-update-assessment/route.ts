// =============================================================================
// FILE: app/api/submit-update-assessment/route.ts
// =============================================================================
//
// SERVER-SIDE HANDLER — Update Assessment Submission
//
// WHAT THIS DOES:
//   1. Authenticates the user
//   2. Fetches their current baseline snapshot (for delta comparison)
//   3. Fetches their current responses (to reconstruct baseline NeuroLoadResult)
//   4. Separates anchor responses from delta fields
//   5. Upserts anchor responses into current_user_responses
//      (this is what updates the dashboard score automatically)
//   6. Runs calculateNeuroLoad on the updated responses
//   7. Runs calculateBaselineDelta against the stored baseline
//   8. Writes a new 'update' snapshot to assessment_snapshots
//   9. Returns the delta result + new snapshot id to the client
//
// THE CLIENT (update page) then redirects to /results/update/[id]
// using the snapshot id returned here.
//
// =============================================================================

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { calculateNeuroLoad } from '@/app/utils/scoring-engine'
import { extractAnchorResponses, extractDeltaFields } from '@/app/lib/update-assessment-protocol'
import { calculateBaselineDelta } from '@/app/lib/baseline-delta-engine'

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
    // This is the stored approximation from the migration.
    // We use it to compute the delta callout on the dashboard.
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
    // We need the full current response set so that questions
    // NOT re-asked in the update (q5, q7–q10, q12–q18, q20,
    // q22–q32) still contribute to the engine calculation.
    // The anchor responses will overwrite their matching keys.
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
    // Build a merged response array: start with all current
    // responses, then overwrite any keys that appear in the
    // anchor responses. This gives the engine a complete set.
    // -------------------------------------------------------

    // Build a map of current responses keyed by question_key
    const currentMap = new Map(
      currentResponses.map((r: any) => [
        r.question_key,
        { question_key: r.question_key, answer: { response: r.answer_value } }
      ])
    )

    // Overwrite with new anchor values
    anchorResponses.forEach(r => {
      currentMap.set(r.question_key, r)
    })

    const mergedResponses = Array.from(currentMap.values())

    // -------------------------------------------------------
    // STEP 7 — RUN THE SCORING ENGINE ON MERGED RESPONSES
    // This produces the update NeuroLoadResult.
    // -------------------------------------------------------

    const neuroLensRaw = currentMap.get('neuro_lens')?.answer?.response || 'None'

    const updateResult = calculateNeuroLoad(mergedResponses, neuroLensRaw)

    // -------------------------------------------------------
    // STEP 8 — RECONSTRUCT BASELINE NEUROLOADRESULT
    // The engine needs a full NeuroLoadResult for the baseline
    // to run calculateBaselineDelta. We reconstruct it from the
    // stored snapshot percentIndices (already normalised 0–100).
    // -------------------------------------------------------

    const baselineResult = {
      rawIndices:       { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 }, // not needed for delta
      percentIndices:   {
        cii: baselineSnapshot.cii,
        ali: baselineSnapshot.ali,
        pli: baselineSnapshot.pli,
        stl: baselineSnapshot.stl,
        rci: baselineSnapshot.rci
      },
      weightedIndices:  { cii: 0, ali: 0, pli: 0, stl: 0, rci: 0 }, // not needed for delta
      finalNeuroLoad:   baselineSnapshot.neuro_load,
      systemState:      baselineSnapshot.system_state,
      interactionFlags: { restorativeDeficit: false, sensoryHypervigilance: false, cognitiveStrain: false },
      priorityDomains:  [],
      recoveryModifier: 'neutral' as const,
      sensoryProfile:   {
        threshold:             'low' as const,
        regulation:            'passive' as const,
        pattern:               (baselineSnapshot.sensory_pattern || 'sensitive') as any,
        blendApplied:          false,
        thresholdDifferential: 0
      },
      energyTaxBaseline: baselineSnapshot.energy_tax,
      primaryStrain:     'None of the above'
    }

    // -------------------------------------------------------
    // STEP 9 — CALCULATE THE DELTA
    // -------------------------------------------------------

    // Build delta fields in the format calculateBaselineDelta expects
    const formattedDeltaFields = {
      cii_delta_self:             Number(deltaFields.cii_delta_self)  || 3,
      ali_delta_self:             Number(deltaFields.ali_delta_self)  || 3,
      pli_delta_self:             Number(deltaFields.pli_delta_self)  || 3,
      stl_delta_self:             Number(deltaFields.stl_delta_self)  || 3,
      rci_delta_self:             Number(deltaFields.rci_delta_self)  || 3,
      subjective_alignment_score: Number(deltaFields.subjective_alignment_score) || 3,
      env_change_sleep:           deltaFields.env_change_sleep  || [],
      env_change_day:             deltaFields.env_change_day    || [],
      life_context_change:        deltaFields.life_context_change || []
    }

    const deltaReport = calculateBaselineDelta(
      baselineResult,
      updateResult,
      baselineSnapshot.id,
      'pending', // will be replaced with actual snapshot id after insert
      formattedDeltaFields
    )

    // -------------------------------------------------------
    // STEP 10 — UPSERT ANCHOR RESPONSES INTO current_user_responses
    // This is what automatically updates the dashboard score.
    // upsert with onConflict: question_key + user_id means:
    //   if the row exists → update answer_value
    //   if it does not   → insert it
    // -------------------------------------------------------

    const upsertRows = anchorResponses.map(r => ({
      user_id:      user.id,
      question_key: r.question_key,
      answer_value: String(r.answer.response)
    }))

    const { error: upsertError } = await supabase
      .from('current_user_responses')
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
    // This records the post-update state for future delta
    // comparisons and for the dashboard delta callout.
    // -------------------------------------------------------

    const { data: newSnapshot, error: snapshotInsertError } = await supabase
      .from('assessment_snapshots')
      .insert({
        user_id:         user.id,
        snapshot_type:   'update',
        neuro_load:      updateResult.finalNeuroLoad,
        cii:             Math.round(updateResult.percentIndices.cii),
        ali:             Math.round(updateResult.percentIndices.ali),
        pli:             Math.round(updateResult.percentIndices.pli),
        stl:             Math.round(updateResult.percentIndices.stl),
        rci:             Math.round(updateResult.percentIndices.rci),
        energy_tax:      updateResult.energyTaxBaseline,
        system_state:    updateResult.systemState,
        sensory_pattern: updateResult.sensoryProfile.pattern
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
    // STEP 12 — STORE DELTA REPORT FIELDS ON THE SNAPSHOT
    // We store the delta fields as JSONB on the snapshot row
    // so the results page can fetch everything in one query.
    // This requires a delta_report column on assessment_snapshots
    // — see the SQL note below.
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
    // The update page uses this id to redirect to results.
    // -------------------------------------------------------

    return NextResponse.json({
      success:         true,
      snapshot_id:     newSnapshot.id,
      neuro_load:      updateResult.finalNeuroLoad,
      system_state:    updateResult.systemState,
      load_delta:      deltaReport.load_delta,
      load_direction:  deltaReport.load_direction,
      overall_progress: deltaReport.overall_progress
    })

  } catch (err) {
    console.error('Submit update assessment error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
