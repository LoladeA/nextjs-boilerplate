// app/api/calculate-bsfi/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

// -----------------------------
// Validation Schema
// -----------------------------
const DailyLogSchema = z.object({
  date: z.string().min(1),

  morning_lux: z.number().nonnegative().nullable().optional(),
  evening_lux: z.number().nonnegative().nullable().optional(),

  daytime_db: z.number().nonnegative().nullable().optional(),
  nighttime_db: z.number().nonnegative().nullable().optional(),

  morning_tension: z.number().min(0).max(10).nullable().optional(),
  sleep_wakes: z.number().min(0).max(20).nullable().optional(),
  focus_hours: z.number().min(0).max(24).nullable().optional(),
  mood_score: z.number().min(0).max(10).nullable().optional(),

  tags: z.array(z.string()).optional(),
  evening_tags: z.array(z.string()).optional(),
})

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
    // 1. Validate Input
    // -----------------------------
    const parsed = DailyLogSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const todayLogRaw = parsed.data

    // -----------------------------
    // 2. Normalize Today's Log
    // Preserve null — do NOT default to 0
    // -----------------------------
    const todayParams: DailyLogParams = {
      morning_lux: todayLogRaw.morning_lux ?? null,
      evening_lux: todayLogRaw.evening_lux ?? null,
      daytime_db: todayLogRaw.daytime_db ?? null,
      nighttime_db: todayLogRaw.nighttime_db ?? null,
      morning_tension: todayLogRaw.morning_tension ?? null,
      sleep_wakes: todayLogRaw.sleep_wakes ?? null,
      focus_hours: todayLogRaw.focus_hours ?? null,
      mood_score: todayLogRaw.mood_score ?? null,
      morning_tags: todayLogRaw.tags ?? [],
      evening_tags: todayLogRaw.evening_tags ?? [],
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
      .lt('date', todayLogRaw.date) // exclude today
      .order('date', { ascending: false })

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`)
    }

    // -----------------------------
    // 4. Normalize History
    // -----------------------------
    const historyParams: DailyLogParams[] = (historyData || []).map(log => ({
      morning_lux: log.morning_lux ?? null,
      evening_lux: log.evening_lux ?? null,
      daytime_db: log.daytime_db ?? null,
      nighttime_db: log.nighttime_db ?? null,
      morning_tension: log.morning_tension ?? null,
      sleep_wakes: log.sleep_wakes ?? null,
      focus_hours: log.focus_hours ?? null,
      mood_score: log.mood_score ?? null,
      morning_tags: log.tags ?? [],
      evening_tags: log.evening_tags ?? [],
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
        date: todayLogRaw.date,
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
    // Requires unique index:
    // (user_id, calculated_for_date, version)
    // -----------------------------
    const { error: upsertError } = await supabase
      .from('bsfi_results')
      .upsert({
        user_id: userId,
        calculated_for_date: todayLogRaw.date,
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
