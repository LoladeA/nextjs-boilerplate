// app/api/calculate-bsfi/route.ts
//
// CHANGE LOG (this version):
//
//   PROFILE CONTEXT BRIDGE
//   Before running the BSFI engine, the route now reads two things from
//   the database:
//
//     1. sensory_pattern  — from the user's latest assessment_snapshots row.
//        Already populated for the most recent snapshot (value: 'sensitive').
//        NULL for users with no completed assessment — handled gracefully.
//
//     2. integration_pattern — derived from q_int1, q_int2, q_int3 responses
//        in current_user_responses. Uses identical threshold logic to the
//        assessment scoring engine (scoring-engine.ts Step 3). Defaults to
//        'integrative' for users who predate the integration questions — the
//        safest neutral assumption (no weight inflation on an unknown profile).
//
//   These two values are stamped onto the bsfi_results row alongside the
//   existing result fields. accumulative_ali_flag is derived at write time:
//   TRUE when integration_pattern is 'accumulative' AND als_score falls in
//   the mid-range band (10–16 of 25 max, equivalent to 40–65%).
//
//   THE BSFI ENGINE (calculateBSFI) IS UNCHANGED.
//   Profile context is read and written by the route — the engine signature
//   and internal logic are not modified.
//
//   GRACEFUL DEGRADATION
//   All profile context reads are non-blocking. If assessment_snapshots has
//   no row for the user, or q_int1–q_int3 are absent from current_user_responses,
//   the route continues with safe defaults and the BSFI calculation is
//   unaffected. bsfi_results rows written without profile context will have
//   NULL integration_pattern and sensory_pattern — consistent with the
//   pre-migration rows already in the table.

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type IntegrationPattern = 'integrative' | 'mixed' | 'accumulative'
type SensoryPattern     = 'sensitive' | 'avoider' | 'low_registration' | 'seeker'

// -----------------------------------------------------------------------------
// SAFE NUMBER COERCION
// -----------------------------------------------------------------------------
const safeNum = (val: unknown): number | null => {
  if (val === null || val === undefined) return null
  if (typeof val === 'boolean') return null
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed === '') return null
    const parsed = Number(trimmed)
    if (isNaN(parsed) || !isFinite(parsed)) return parsed === parsed ? parsed : null
    return parsed
  }
  if (typeof val === 'number') {
    if (!isFinite(val) || isNaN(val)) return null
    return val
  }
  return null
}

// -----------------------------------------------------------------------------
// DERIVE INTEGRATION PATTERN
//
// Identical threshold logic to scoring-engine.ts Step 3 (calculateNeuroLoad).
// q_int1, q_int2, q_int3 are 1–5 scale responses.
// Each normalised to 0–100: (val - 1) / 4 * 100
// Averaged across the three questions.
//
// 0–35:  integrative  (sensation resolves with recovery)
// 36–64: mixed        (context-dependent)
// 65–100: accumulative (sensation layers and persists)
//
// Default: 'integrative' — the safest neutral assumption for users who
// predate the integration questions. Does not inflate weights on an unknown
// profile.
// -----------------------------------------------------------------------------
const deriveIntegrationPattern = (
  int1: string | null,
  int2: string | null,
  int3: string | null
): IntegrationPattern => {
  const vals = [int1, int2, int3].map(v => safeNum(v))

  // If all three are null, user predates integration questions — use default
  if (vals.every(v => v === null)) return 'integrative'

  // Replace nulls with 3 (midpoint — neutral) for any missing individual values
  const normalised = vals.map(v => {
    const safe = v ?? 3
    const clamped = Math.min(Math.max(safe, 1), 5)
    return ((clamped - 1) / 4) * 100
  })

  const average = Math.round(
    normalised.reduce((a, b) => a + b, 0) / normalised.length
  )

  if (average <= 35)  return 'integrative'
  if (average >= 65)  return 'accumulative'
  return 'mixed'
}

// -----------------------------------------------------------------------------
// DERIVE ACCUMULATIVE ALI FLAG
//
// Mirrors the accumulativeALIFlag logic from scoring-engine.ts Step 13.
// Applied here to the daily ALS (Acoustic Load Score) as a proxy for ALI.
//
// ALS is capped at 25 (raw points). Mid-range 40–65% of 25 = 10–16.
// Flag is TRUE when:
//   - integration_pattern is 'accumulative', AND
//   - als_score falls in the 10–16 band
//
// Rationale: a mid-range ALS on an accumulative profile carries higher
// effective load than the number alone suggests. The system is already
// carrying what it has not cleared from prior exposures.
// -----------------------------------------------------------------------------
const deriveAccumulativeALIFlag = (
  integrationPattern: IntegrationPattern,
  alsScore: number
): boolean => {
  return (
    integrationPattern === 'accumulative' &&
    alsScore >= 10 &&
    alsScore <= 16
  )
}

// -----------------------------------------------------------------------------
// MAIN ROUTE
// -----------------------------------------------------------------------------

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const raw = await req.json()

    // -------------------------------------------------------------------------
    // 1. Validate Core Input
    // -------------------------------------------------------------------------
    if (!raw.date || typeof raw.date !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing date' }, { status: 400 })
    }

    // -------------------------------------------------------------------------
    // 2. Validate session parameter
    // -------------------------------------------------------------------------
    const logSession: 'morning' | 'evening' =
      raw.session === 'evening' ? 'evening' : 'morning'

    // -------------------------------------------------------------------------
    // 3. Normalise Today's Log
    // -------------------------------------------------------------------------
    const todayParams: DailyLogParams = {
      morning_lux:     safeNum(raw.morning_lux),
      evening_lux:     safeNum(raw.evening_lux),
      daytime_db:      safeNum(raw.daytime_db),
      nighttime_db:    safeNum(raw.bedtime_db),
      morning_tension: safeNum(raw.morning_tension),
      sleep_wakes:     safeNum(raw.sleep_wakes),
      focus_hours:     safeNum(raw.focus_hours),
      mood_score:      safeNum(raw.mood_score),
      morning_tags:    Array.isArray(raw.tags) ? raw.tags : [],
      evening_tags:    Array.isArray(raw.evening_tags) ? raw.evening_tags : [],
    }

    // -------------------------------------------------------------------------
    // 4. Fetch 14-Day History Window
    // -------------------------------------------------------------------------
    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - 13)

    const { data: historyData, error: historyError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', windowStart.toISOString().split('T')[0])
      .lt('date', raw.date)
      .order('date', { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`)
    }

    // -------------------------------------------------------------------------
    // 5. Normalise History
    // -------------------------------------------------------------------------
    const historyParams: DailyLogParams[] = (historyData || []).map(log => ({
      morning_lux:     safeNum(log.morning_lux),
      evening_lux:     safeNum(log.evening_lux),
      daytime_db:      safeNum(log.daytime_db),
      nighttime_db:    safeNum(log.bedtime_db),
      morning_tension: safeNum(log.morning_tension),
      sleep_wakes:     safeNum(log.sleep_wakes),
      focus_hours:     safeNum(log.focus_hours),
      mood_score:      safeNum(log.mood_score),
      morning_tags:    Array.isArray(log.tags) ? log.tags : [],
      evening_tags:    Array.isArray(log.evening_tags) ? log.evening_tags : [],
    }))

    // -------------------------------------------------------------------------
    // 6. READ PROFILE CONTEXT
    //
    // Two parallel reads — both non-blocking. Errors are caught and logged
    // without interrupting the BSFI calculation.
    // -------------------------------------------------------------------------

    // 6a. sensory_pattern — latest assessment snapshot
    let sensoryPattern: SensoryPattern | null = null

    try {
      const { data: snapshotData } = await supabase
        .from('assessment_snapshots')
        .select('sensory_pattern')
        .eq('user_id', userId)
        .not('sensory_pattern', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (snapshotData?.sensory_pattern) {
        sensoryPattern = snapshotData.sensory_pattern as SensoryPattern
      }
    } catch {
      // No snapshot found — sensoryPattern remains null
      // bsfi_results row will have null sensory_pattern, consistent with
      // pre-migration rows
    }

    // 6b. integration_pattern — derived from q_int1, q_int2, q_int3
    let integrationPattern: IntegrationPattern = 'integrative'

    try {
      const { data: intResponses } = await supabase
        .from('current_user_responses')
        .select('question_key, answer_value')
        .eq('user_id', userId)
        .in('question_key', ['q_int1', 'q_int2', 'q_int3'])

      if (intResponses && intResponses.length > 0) {
        const getVal = (key: string) =>
          intResponses.find(r => r.question_key === key)?.answer_value ?? null

        integrationPattern = deriveIntegrationPattern(
          getVal('q_int1'),
          getVal('q_int2'),
          getVal('q_int3')
        )
      }
      // If no integration responses found — default 'integrative' already set above
    } catch {
      // Integration responses unreadable — default 'integrative' already set
    }

    // -------------------------------------------------------------------------
    // 7. Run BSFI Engine — UNCHANGED
    // -------------------------------------------------------------------------
    let bsfiResult

    try {
      bsfiResult = calculateBSFI(todayParams, historyParams)
    } catch (engineError: any) {
      console.error('BSFI Engine Failure', {
        userId,
        date: raw.date,
        session: logSession,
        historyLength: historyParams.length,
        error: engineError,
      })
      return NextResponse.json(
        { error: 'BSFI calculation failed internally' },
        { status: 500 }
      )
    }

    // -------------------------------------------------------------------------
    // 8. Derive accumulative ALI flag from profile context + engine result
    // -------------------------------------------------------------------------
    const accumulativeALIFlag = deriveAccumulativeALIFlag(
      integrationPattern,
      bsfiResult.als_score
    )

    // -------------------------------------------------------------------------
    // 9. Save to bsfi_results
    //
    // Three new fields added to the upsert payload:
    //   integration_pattern    — from current_user_responses (q_int1–q_int3)
    //   sensory_pattern        — from assessment_snapshots (latest row)
    //   accumulative_ali_flag  — derived from integration_pattern + als_score
    //
    // onConflict target unchanged: (user_id, calculated_for_date, session)
    // -------------------------------------------------------------------------
    const { error: upsertError } = await supabase
      .from('bsfi_results')
      .upsert(
        {
          user_id:             userId,
          calculated_for_date: raw.date,
          session:             logSession,
          domain_scores: {
            CFS:                bsfiResult.cfs_score,
            ALS:                bsfiResult.als_score,
            SES:                bsfiResult.ses_score,
            RDS:                bsfiResult.rds_score,
            is_internal_driver: bsfiResult.is_internal_driver,
          },
          total_score:           bsfiResult.bsfi_total,
          dominant_domain:       bsfiResult.dominant_domain,
          version:               bsfiResult.version,
          // PROFILE CONTEXT — new fields
          integration_pattern:   integrationPattern,
          sensory_pattern:       sensoryPattern,
          accumulative_ali_flag: accumulativeALIFlag,
        },
        {
          onConflict: 'user_id, calculated_for_date, session'
        }
      )

    if (upsertError) {
      throw new Error(`Failed to save BSFI result: ${upsertError.message}`)
    }

    // -------------------------------------------------------------------------
    // 10. Return Response
    //
    // profileContext added to the response payload so the progress page
    // can read it directly without a second query.
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success:           true,
      bsfiResult,
      session:           logSession,
      history_days_used: historyParams.length,
      profileContext: {
        integration_pattern:   integrationPattern,
        sensory_pattern:       sensoryPattern,
        accumulative_ali_flag: accumulativeALIFlag,
      }
    })

  } catch (error: any) {
    console.error('BSFI Calculation Route Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
