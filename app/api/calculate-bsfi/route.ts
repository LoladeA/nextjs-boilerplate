// /app/api/calculate-bsfi/route.ts
// v8 — clean rebuild

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
    calculateMorningBSFI,
    calculateEveningBSFI,
    DailyLogParams,
} from '@/lib/bsfi-engine'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const safeNum = (val: unknown): number | null => {
    if (val === null || val === undefined || typeof val === 'boolean') return null
    if (typeof val === 'string') {
        const parsed = Number(val.trim())
        return isNaN(parsed) ? null : parsed
    }
    return typeof val === 'number' && isFinite(val) ? val : null
}

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

// ─────────────────────────────────────────────────────────────────────────────
// BACKWARD COMPATIBILITY — V7 FIELD MAPPING
//
// Old fields in the payload or database map to new v8 field names.
// Priority: v8 field name wins if present; falls back to legacy name.
//
//   daytime_db  → daytime_db_avg (old single dB → average)
//   bedtime_db  → nighttime_db   (old bedtime measure → morning ambient)
//
// Fields with no v7 equivalent default to null (spatial_reset defaults false).
// ─────────────────────────────────────────────────────────────────────────────
const mapToV8Params = (src: any): DailyLogParams => ({
    // Morning fields
    morning_lux:      safeNum(src.morning_lux),
    wake_time:        src.created_at ?? null,
    sleep_wakes:      safeNum(src.sleep_wakes),
    nighttime_db:     safeNum(src.nighttime_db  ?? src.bedtime_db),  // v8 new / v7 bedtime_db
    morning_tension:  safeNum(src.morning_tension),
    morning_mood:     safeNum(src.mood_score),   // daily log field name
    morning_tags:     Array.isArray(src.tags) ? src.tags : [],

    // Evening fields
    evening_lux:      safeNum(src.evening_lux),
    daytime_db_avg:   safeNum(src.daytime_db_avg ?? src.daytime_db), // v8 new / v7 legacy
    daytime_db_peak:  safeNum(src.daytime_db_peak  ?? null),         // v8 new, no v7 equivalent
    noise_character:  src.noise_character  ?? null,
    social_demand:    src.social_demand    ?? null,
    spatial_reset:    typeof src.spatial_reset === 'boolean'
                        ? src.spatial_reset
                        // backward compat: derive from entropy_reset tag presence
                        : Array.isArray(src.evening_tags) && src.evening_tags.includes('entropy_reset'),
    task_init_drag:   src.task_init_drag   ?? null,
    focus_hours:      safeNum(src.focus_hours),
    environmental_control_score: safeNum(src.environmental_control_score ?? null),
    evening_tags:     Array.isArray(src.evening_tags) ? src.evening_tags : [],

    // Biological
    cycle_phase:      src.cycle_phase ?? null,
})

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies })
        const { data: { session: userSession } } = await supabase.auth.getSession()
        if (!userSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = userSession.user.id
        const raw    = await req.json()

        // ── 1. MAP PARAMS ──────────────────────────────────────────────────
        const todayParams = mapToV8Params(raw)

        // ── 2. FETCH HISTORY ───────────────────────────────────────────────
        const windowStart = new Date()
        windowStart.setDate(windowStart.getDate() - 13)

        const { data: historyData } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('date', windowStart.toISOString().split('T')[0])
            .lt('date', raw.date)
            .order('date', { ascending: false })

        const historyParams: DailyLogParams[] = (historyData || []).map(mapToV8Params)

        // ── 3. FETCH PROFILE CONTEXT ───────────────────────────────────────
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

        // ── 4. EXECUTE ENGINE ──────────────────────────────────────────────
        // Morning and evening are now separate functions.
        // No session parameter. No contamination possible.
        const logSession: 'morning' | 'evening' = raw.session === 'evening' ? 'evening' : 'morning'

        const bsfiResult = logSession === 'morning'
            ? calculateMorningBSFI(todayParams, historyParams)
            : calculateEveningBSFI(todayParams, historyParams)

        // ── 5. PERSIST ─────────────────────────────────────────────────────
        const { error: upsertError } = await supabase
            .from('bsfi_results')
            .upsert({
                user_id:             userId,
                calculated_for_date: raw.date,
                session:             logSession,
                total_score:         bsfiResult.bsfi_total,
                dominant_domain:     bsfiResult.dominant_domain,
                version:             bsfiResult.version,
                domain_scores: {
                    CFS:                 bsfiResult.cfs_score,
                    ALS:                 bsfiResult.als_score,
                    SES:                 bsfiResult.ses_score,
                    RDS:                 bsfiResult.rds_score,
                    raw_total:           bsfiResult.raw_total,
                    biological_capacity: bsfiResult.biological_capacity,
                    load_attribution:    bsfiResult.load_attribution,
                    biological_load:     bsfiResult.biological_load,
                    // Backward-compatible fields for legacy JSONB reads
                    is_internal_driver:  bsfiResult.load_attribution === 'internal',
                    healthkit_enriched:  false,
                },
                integration_pattern: integrationPattern,
                sensory_pattern:     profile?.sensory_pattern || null,
            }, {
                onConflict: 'user_id, calculated_for_date, session'
            })

        if (upsertError) throw upsertError

        return NextResponse.json({ success: true, bsfiResult })

    } catch (error: any) {
        console.error('BSFI Route Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
