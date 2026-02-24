// app/api/calculate-bsfi/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

// Helper to ensure values are either numbers or safely null
const safeNum = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const parsed = Number(val);
  return isNaN(parsed) ? null : parsed;
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

    // -----------------------------
    // 1. Validate Core Input
    // -----------------------------
    if (!raw.date || typeof raw.date !== 'string') {
        return NextResponse.json({ error: 'Invalid or missing date' }, { status: 400 })
    }

    // -----------------------------
    // 2. Normalize Today's Log (Preserving Nulls securely)
    // -----------------------------
    const todayParams: DailyLogParams = {
      morning_lux: safeNum(raw.morning_lux),
      evening_lux: safeNum(raw.evening_lux),
      daytime_db: safeNum(raw.daytime_db),
      nighttime_db: safeNum(raw.nighttime_db),
      morning_tension: safeNum(raw.morning_tension),
      sleep_wakes: safeNum(raw.sleep_wakes),
      focus_hours: safeNum(raw.focus_hours),
      mood_score: safeNum(raw.mood_score),
      morning_tags: Array.isArray(raw.tags) ? raw.tags : [],
      evening_tags: Array.isArray(raw.evening_tags) ? raw.evening_tags : [],
    }

    // -----------------------------
    // 3. Fetch True 14-Day Window
    // -----------------------------
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { data: historyData, error: historyError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
      .lt('date', raw.date) // exclude today
      .order('date', { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`)
    }

    // -----------------------------
    // 4. Normalize History
    // -----------------------------
    const historyParams: DailyLogParams[] = (historyData || []).map(log => ({
      morning_lux: safeNum(log.morning_lux),
      evening_lux: safeNum(log.evening_lux),
      daytime_db: safeNum(log.daytime_db),
      nighttime_db: safeNum(log.nighttime_db),
      morning_tension: safeNum(log.morning_tension),
      sleep_wakes: safeNum(log.sleep_wakes),
      focus_hours: safeNum(log.focus_hours),
      mood_score: safeNum(log.mood_score),
      morning_tags: Array.isArray(log.tags) ? log.tags : [],
      evening_tags: Array.isArray(log.evening_tags) ? log.evening_tags : [],
    }))

    // -----------------------------
    // 5. Run Calculation Engine Safely
    // -----------------------------
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

    // -----------------------------
    // 6. Idempotent Save (Upsert)
    // -----------------------------
    const { error: upsertError } = await supabase
      .from('bsfi_results')
      .upsert({
        user_id: userId,
        calculated_for_date: raw.date,
        domain_scores: {
          CFS: bsfiResult.cfs_score,
          ALS: bsfiResult.als_score,
          SES: bsfiResult.ses_score,
          RDS: bsfiResult.rds_score,
          is_internal_driver: bsfiResult.is_internal_driver
        },
        total_score: bsfiResult.bsfi_total,
        dominant_domain: bsfiResult.dominant_domain,
        version: bsfiResult.version
      })

    if (upsertError) {
      throw new Error(`Failed to save BSFI result: ${upsertError.message}`)
    }

    // -----------------------------
    // 7. Return Response
    // -----------------------------
    return NextResponse.json({
      success: true,
      bsfiResult,
      history_days_used: historyParams.length
    })

  } catch (error: any) {
    console.error('BSFI Calculation Route Error:', error)

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
