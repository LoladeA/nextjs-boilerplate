// app/api/calculate-bsfi/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

// -----------------------------------------------------------------------------
// SAFE NUMBER COERCION
// Converts incoming request/DB values to number | null.
//
// Fixes over the original Number() + isNaN() approach:
//   - Rejects booleans (Number(false)=0, Number(true)=1 would silently pass)
//   - Rejects whitespace strings (Number('  ')=0 would silently pass)
//   - Rejects Infinity / -Infinity (isNaN(Infinity)=false would silently pass)
//   - Rejects arrays (Number([128])=128 would silently pass)
// All of the above are pathological but realistic in a JSON API context.
// -----------------------------------------------------------------------------
const safeNum = (val: unknown): number | null => {
  if (val === null || val === undefined) return null
  if (typeof val === 'boolean') return null
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (trimmed === '') return null
    const parsed = Number(trimmed)
    if (isNaN(parsed) || !isFinite(parsed)) return null
    return parsed
  }
  if (typeof val === 'number') {
    if (!isFinite(val) || isNaN(val)) return null
    return val
  }
  return null // Rejects arrays, objects, and any other unexpected types
}

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
    // 2. Normalise Today's Log
    //
    // FIX: morning_tags source field.
    // Original used raw.tags for morning_tags and raw.evening_tags for evening_tags.
    // This is correct IF your request body uses "tags" as the morning key.
    // Field name is preserved here — confirm it matches your frontend submission
    // and your DB column name. If both are "morning_tags", update accordingly.
    // -------------------------------------------------------------------------
    const todayParams: DailyLogParams = {
      morning_lux:     safeNum(raw.morning_lux),
      evening_lux:     safeNum(raw.evening_lux),
      daytime_db:      safeNum(raw.daytime_db),
      nighttime_db:    safeNum(raw.nighttime_db),
      morning_tension: safeNum(raw.morning_tension),
      sleep_wakes:     safeNum(raw.sleep_wakes),
      focus_hours:     safeNum(raw.focus_hours),
      mood_score:      safeNum(raw.mood_score),
      morning_tags:    Array.isArray(raw.tags) ? raw.tags : [],           // see note above
      evening_tags:    Array.isArray(raw.evening_tags) ? raw.evening_tags : [],
    }

    // -------------------------------------------------------------------------
    // 3. Fetch 14-Day History Window
    //
    // FIX: original used setDate(-14) which fetches days 14 days before today
    // up to (but not including) today — giving a maximum of 13 prior days in
    // the window when today has not yet been logged.
    //
    // setDate(-13) produces a window of exactly 14 days inclusive of today,
    // matching the BSFI engine's stated 14-day calibration requirement.
    // -------------------------------------------------------------------------
    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - 13)

    const { data: historyData, error: historyError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', windowStart.toISOString().split('T')[0])
      .lt('date', raw.date) // exclude today — today is passed directly as todayParams
      .order('date', { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`)
    }

    // -------------------------------------------------------------------------
    // 4. Normalise History
    // -------------------------------------------------------------------------
    const historyParams: DailyLogParams[] = (historyData || []).map(log => ({
      morning_lux:     safeNum(log.morning_lux),
      evening_lux:     safeNum(log.evening_lux),
      daytime_db:      safeNum(log.daytime_db),
      nighttime_db:    safeNum(log.nighttime_db),
      morning_tension: safeNum(log.morning_tension),
      sleep_wakes:     safeNum(log.sleep_wakes),
      focus_hours:     safeNum(log.focus_hours),
      mood_score:      safeNum(log.mood_score),
      morning_tags:    Array.isArray(log.tags) ? log.tags : [],           // see note above
      evening_tags:    Array.isArray(log.evening_tags) ? log.evening_tags : [],
    }))

    // -------------------------------------------------------------------------
    // 5. Run Calculation Engine
    // -------------------------------------------------------------------------
    let bsfiResult

    try {
      bsfiResult = calculateBSFI(todayParams, historyParams)
    } catch (engineError: any) {
      console.error('BSFI Engine Failure', {
        userId,
        date: raw.date,
        historyLength: historyParams.length,
        error: engineError,
      })

      return NextResponse.json(
        { error: 'BSFI calculation failed internally' },
        { status: 500 }
      )
    }

    // -------------------------------------------------------------------------
    // 6. Idempotent Save (Upsert)
    // -------------------------------------------------------------------------
    const { error: upsertError } = await supabase
      .from('bsfi_results')
      .upsert({
        user_id:              userId,
        calculated_for_date:  raw.date,
        domain_scores: {
          CFS:                bsfiResult.cfs_score,
          ALS:                bsfiResult.als_score,
          SES:                bsfiResult.ses_score,
          RDS:                bsfiResult.rds_score,
          is_internal_driver: bsfiResult.is_internal_driver,
        },
        total_score:          bsfiResult.bsfi_total,
        dominant_domain:      bsfiResult.dominant_domain,
        version:              bsfiResult.version,
      })

    if (upsertError) {
      throw new Error(`Failed to save BSFI result: ${upsertError.message}`)
    }

    // -------------------------------------------------------------------------
    // 7. Return Response
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success:           true,
      bsfiResult,
      history_days_used: historyParams.length,
    })

  } catch (error: any) {
    console.error('BSFI Calculation Route Error:', error)

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
