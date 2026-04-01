// /app/api/calculate-bsfi/route.ts

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams } from '@/lib/bsfi-engine'
import { getAttributionCopy } from '@/lib/bsfi-attribution-copy'

// -----------------------------------------------------------------------------
// TYPES & MAPPINGS
// -----------------------------------------------------------------------------
type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'

const safeNum = (val: unknown): number | null => {
    if (val === null || val === undefined || typeof val === 'boolean') return null
    if (typeof val === 'string') {
        const parsed = Number(val.trim())
        return isNaN(parsed) ? null : parsed
    }
    return typeof val === 'number' && isFinite(val) ? val : null
}

// -----------------------------------------------------------------------------
// DERIVE INTEGRATION VARIANT
// -----------------------------------------------------------------------------
const deriveIntegrationVariant = (responses: any[]): IntegrationVariant => {
    const vals = ['q_int1', 'q_int2', 'q_int3'].map(key =>
        safeNum(responses.find(r => r.question_key === key)?.answer_value)
    )
    const average = vals.reduce((a, b) => a + (b ?? 3), 0) / 3
    const score = ((average - 1) / 4) * 100
    if (score <= 35) return 'integrative'
    if (score >= 65) return 'accumulative'
    return 'mixed'
}

export async function POST(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session: userSession } } = await supabase.auth.getSession()
        if (!userSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = userSession.user.id
        const raw = await req.json()

        // ─────────────────────────────────────────────────────────────────────
        // 1. PREPARE DAILY LOG PARAMS (v7.1)
        // ─────────────────────────────────────────────────────────────────────
        const todayParams: DailyLogParams = {
            morning_lux:     safeNum(raw.morning_lux),
            evening_lux:     safeNum(raw.evening_lux),
            daytime_db:      safeNum(raw.daytime_db),
            nighttime_db:    safeNum(raw.bedtime_db),
            morning_tension: safeNum(raw.morning_tension),
            sleep_wakes:     safeNum(raw.sleep_wakes),
            focus_hours:     safeNum(raw.focus_hours),
            mood_score:      safeNum(raw.mood_score),
            morning_tags:    Array.isArray(raw.tags)         ? raw.tags         : [],
            evening_tags:    Array.isArray(raw.evening_tags) ? raw.evening_tags : [],
            social_demand:   raw.social_demand  ?? null,
            cycle_phase:     raw.cycle_phase    ?? null,
            wake_time:       raw.created_at     ?? null,
        }

        // ─────────────────────────────────────────────────────────────────────
        // 2. FETCH HISTORY (14-day window)
        // ─────────────────────────────────────────────────────────────────────
        const windowStart = new Date()
        windowStart.setDate(windowStart.getDate() - 13)

        const { data: historyData } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('date', windowStart.toISOString().split('T')[0])
            .lt('date', raw.date)
            .order('date', { ascending: false })

        const historyParams: DailyLogParams[] = (historyData || []).map(log => ({
            morning_lux:     log.morning_lux     ?? null,
            evening_lux:     log.evening_lux     ?? null,
            daytime_db:      log.daytime_db      ?? null,
            nighttime_db:    log.bedtime_db      ?? null,
            morning_tension: log.morning_tension ?? null,
            sleep_wakes:     log.sleep_wakes     ?? null,
            focus_hours:     log.focus_hours     ?? null,
            mood_score:      log.mood_score      ?? null,
            morning_tags:    log.tags            ?? [],
            evening_tags:    log.evening_tags    ?? [],
            social_demand:   log.social_demand   ?? null,
            cycle_phase:     log.cycle_phase     ?? null,
            wake_time:       log.created_at      ?? null,
        }))

        // ─────────────────────────────────────────────────────────────────────
        // 3. FETCH PROFILE CONTEXT
        // ─────────────────────────────────────────────────────────────────────
        const { data: profile } = await supabase
            .from('assessment_snapshots')
            .select('sensory_pattern, energy_tax_baseline')
            .eq('user_id', userId)
            .eq('snapshot_type', 'initial')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const { data: intResponses } = await supabase
            .from('current_user_responses')
            .select('question_key, answer_value')
            .eq('user_id', userId)
            .in('question_key', ['q_int1', 'q_int2', 'q_int3'])

        const integrationPattern = deriveIntegrationVariant(intResponses || [])

        // ─────────────────────────────────────────────────────────────────────
        // 4. EXECUTE ENGINE (v7.1 — session-aware)
        // ─────────────────────────────────────────────────────────────────────
        const sessionType = raw.session === 'evening' ? 'evening' : 'morning'
        const bsfiResult = calculateBSFI(todayParams, historyParams, sessionType)
        
        // 5. GENERATE ATTRIBUTION COPY (Mirror → Reframe → Direction)
        const attributionCopy = getAttributionCopy(bsfiResult.load_attribution)

        // ─────────────────────────────────────────────────────────────────────
        // 6. PERSIST RESULTS
        // ─────────────────────────────────────────────────────────────────────
        const { error: upsertError } = await supabase
            .from('bsfi_results')
            .upsert({
                user_id:             userId,
                calculated_for_date: raw.date,
                session:             sessionType,
                total_score:         bsfiResult.bsfi_total,
                dominant_domain:     bsfiResult.dominant_domain,
                version:             bsfiResult.version,
                domain_scores: {
                    CFS:               bsfiResult.cfs_score,
                    ALS:               bsfiResult.als_score,
                    SES:               bsfiResult.ses_score,
                    RDS:               bsfiResult.rds_score,
                    load_attribution:  bsfiResult.load_attribution,
                    biological_load:   bsfiResult.biological_load,
                    is_internal_driver:  bsfiResult.load_attribution === 'internal',
                    healthkit_enriched:  false,
                    // Persist the narrative within domain_scores for historical stability
                    // This does not overwrite frontend logic but provides a baseline for synthesis.
                    attribution_copy:    attributionCopy, 
                },
                integration_pattern: integrationPattern,
                sensory_pattern:     profile?.sensory_pattern || null,
            }, {
                onConflict: 'user_id, calculated_for_date, session'
            })

        if (upsertError) throw upsertError

        return NextResponse.json({ success: true, bsfiResult, attributionCopy })

    } catch (error: any) {
        console.error('BSFI Route Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
