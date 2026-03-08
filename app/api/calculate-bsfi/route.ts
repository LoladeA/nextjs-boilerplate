// app/api/calculate-bsfi/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'

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
    if (isNaN(parsed) || !isFinite(parsed)) return null
    return parsed
  }
  if (typeof val === 'number') {
    if (!isFinite(val) || isNaN(val)) return null
    return val
  }
  return null
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
    // 2. Validate and normalise session parameter
    //
    // FIX: session is now read from the request body and validated.
    // progress.tsx sends { session: activeTab } which is 'morning' | 'evening'.
    // Without this, both sessions land in the same row and evening overwrites
    // morning on every save.
    // -------------------------------------------------------------------------
    const logSession: 'morning' | 'evening' =
      raw.session === 'evening' ? 'evening' : 'morning'

    // -------------------------------------------------------------------------
    // 3. Normalise Today's Log
    //
    // FIX: nighttime_db → bedtime_db
    // progress.tsx sends bedtime_db in the payload. The previous mapping used
    // raw.nighttime_db which was always undefined, silently dropping the
    // bedtime sound reading before it reached the engine.
    // -------------------------------------------------------------------------
    const todayParams: DailyLogParams = {
      morning_lux:     safeNum(raw.morning_lux),
      evening_lux:     safeNum(raw.evening_lux),
      daytime_db:      safeNum(raw.daytime_db),
      nighttime_db:    safeNum(raw.bedtime_db),    // FIX: was raw.nighttime_db
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
      nighttime_db:    safeNum(log.bedtime_db),    // FIX: consistent with above
      morning_tension: safeNum(log.morning_tension),
      sleep_wakes:     safeNum(log.sleep_wakes),
      focus_hours:     safeNum(log.focus_hours),
      mood_score:      safeNum(log.mood_score),
      morning_tags:    Array.isArray(log.tags) ? log.tags : [],
      evening_tags:    Array.isArray(log.evening_tags) ? log.evening_tags : [],
    }))

    // -------------------------------------------------------------------------
    // 6. Run Calculation Engine
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
    // 7. Save to bsfi_results
    //
    // FIX: session column now included in both the insert payload and the
    // onConflict target. Morning and evening produce separate rows keyed on
    // (user_id, calculated_for_date, session).
    //
    // PREREQUISITE MIGRATIONS (run once in Supabase SQL editor):
    //
    //   ALTER TABLE bsfi_results
    //   ADD COLUMN IF NOT EXISTS session varchar(10)
    //     CHECK (session IN ('morning', 'evening'));
    //
    //   UPDATE bsfi_results SET session = 'morning' WHERE session IS NULL;
    //
    //   ALTER TABLE bsfi_results
    //   DROP CONSTRAINT IF EXISTS bsfi_results_user_date_key;
    //
    //   ALTER TABLE bsfi_results
    //   ADD CONSTRAINT bsfi_results_user_date_session_key
    //   UNIQUE (user_id, calculated_for_date, session);
    //
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
          total_score:     bsfiResult.bsfi_total,
          dominant_domain: bsfiResult.dominant_domain,
          version:         bsfiResult.version,
        },
        {
          onConflict: 'user_id, calculated_for_date, session'
        }
      )

    if (upsertError) {
      throw new Error(`Failed to save BSFI result: ${upsertError.message}`)
    }

    // -------------------------------------------------------------------------
    // 8. Return Response
    // -------------------------------------------------------------------------
    return NextResponse.json({
      success:           true,
      bsfiResult,
      session:           logSession,
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
