// app/api/calculate-bsfi/route.ts
//
// CORRECTED VERSION:
// 1. Restored full error handling (try/catch) and diagnostic logging for the BSFI engine.
// 2. Aligned with DossierProfile ('anchor' | 'seeker' | 'sensor') 
//    and IntegrationVariant ('integrative' | 'mixed' | 'accumulative') types.
// 3. Strictly preserved the original logic flow to maintain synergy with the application.

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

// -----------------------------------------------------------------------------
// TYPES — Aligned with Sensory Dossier
// -----------------------------------------------------------------------------

type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'
type DossierProfile     = 'anchor' | 'seeker' | 'sensor'

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
// DERIVE INTEGRATION VARIANT
// -----------------------------------------------------------------------------
const deriveIntegrationVariant = (
  int1: string | null,
  int2: string | null,
  int3: string | null
): IntegrationVariant => {
  const vals = [int1, int2, int3].map(v => safeNum(v))

  if (vals.every(v => v === null)) return 'integrative'

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
// -----------------------------------------------------------------------------
const deriveAccumulativeALIFlag = (
  integrationVariant: IntegrationVariant,
  alsScore: number
): boolean => {
  return (
    integrationVariant === 'accumulative' &&
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

    if (!raw.date || typeof raw.date !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing date' }, { status: 400 })
    }

    const logSession: 'morning' | 'evening' =
      raw.session === 'evening' ? 'evening' : 'morning'

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
    // READ PROFILE CONTEXT
    // -------------------------------------------------------------------------

    // 1. sensory_pattern (DossierProfile)
    let sensoryPattern: DossierProfile | null = null

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
        sensoryPattern = snapshotData.sensory_pattern as DossierProfile
      }
    } catch {
      // Graceful degradation
    }

    // 2. integration_pattern (IntegrationVariant)
    let integrationVariant: IntegrationVariant = 'integrative'

    try {
      const { data: intResponses } = await supabase
        .from('current_user_responses')
        .select('question_key, answer_value')
        .eq('user_id', userId)
        .in('question_key', ['q_int1', 'q_int2', 'q_int3'])

      if (intResponses && intResponses.length > 0) {
        const getVal = (key: string) =>
          intResponses.find(r => r.question_key === key)?.answer_value ?? null

        integrationVariant = deriveIntegrationVariant(
          getVal('q_int1'),
          getVal('q_int2'),
          getVal('q_int3')
        )
      }
    } catch {
      // Graceful degradation
    }

    // -------------------------------------------------------------------------
    // Run BSFI Engine — RESTORED ERROR HANDLING
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

    // Derive accumulative ALI flag
    const accumulativeALIFlag = deriveAccumulativeALIFlag(
      integrationVariant,
      bsfiResult.als_score
    )

    // -------------------------------------------------------------------------
    // Save to bsfi_results
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
          // PROFILE CONTEXT
          integration_pattern:   integrationVariant,
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

    return NextResponse.json({
      success:           true,
      bsfiResult,
      session:           logSession,
      history_days_used: historyParams.length,
      profileContext: {
        integration_pattern:   integrationVariant,
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
