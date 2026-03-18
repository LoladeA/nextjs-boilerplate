// /app/api/calculate-bsfi/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { calculateBSFI, DailyLogParams, BSFIResult, BaselineInput } from '@/lib/bsfi-engine'

// -----------------------------------------------------------------------------
// TYPES & MAPPINGS
// -----------------------------------------------------------------------------
type IntegrationVariant = 'integrative' | 'mixed' | 'accumulative'
type DossierProfile     = 'anchor' | 'seeker' | 'sensor'

const safeNum = (val: unknown): number | null => {
    if (val === null || val === undefined || typeof val === 'boolean') return null
    if (typeof val === 'string') {
        const parsed = Number(val.trim())
        return isNaN(parsed) ? null : parsed
    }
    return typeof val === 'number' && isFinite(val) ? val : null
}

// -----------------------------------------------------------------------------
// DERIVE BASELINE INPUTS
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
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const userId = session.user.id
        const raw = await req.json()

        // 1. Prepare Daily Log Params
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
            social_demand:   raw.social_demand || 'low',
        }

        // 2. Fetch History (14-day window)
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
            ...log,
            social_demand: log.social_demand || 'low'
        }))

        // 3. FETCH BASELINE CONTEXT (The V7.3 Requirement)
        const { data: profile } = await supabase
            .from('assessment_snapshots')
            .select('sensory_pattern, energy_tax_baseline')
            .eq('user_id', userId)
            .single()

        const { data: intResponses } = await supabase
            .from('current_user_responses')
            .select('question_key, answer_value')
            .eq('user_id', userId)
            .in('question_key', ['q_int1', 'q_int2', 'q_int3'])

        const integrationPattern = deriveIntegrationVariant(intResponses || [])
        
        // Map DossierProfile to Threshold
        // 'sensor' = low threshold (highly reactive)
        // 'anchor'/'seeker' = high threshold (resilient)
        const threshold: 'low' | 'high' = profile?.sensory_pattern === 'sensor' ? 'low' : 'high'

        const baseline: BaselineInput = {
            threshold,
            integrationPattern,
            energyTaxBaseline: profile?.energy_tax_baseline ?? 50
        }

        // 4. Execute Engine V7.3
        const bsfiResult = calculateBSFI(todayParams, historyParams, baseline)

        // 5. Persist Results
        const { error: upsertError } = await supabase
            .from('bsfi_results')
            .upsert({
                user_id: userId,
                calculated_for_date: raw.date,
                session: raw.session === 'evening' ? 'evening' : 'morning',
                total_score: bsfiResult.bsfi_total,
                dominant_domain: bsfiResult.dominant_domain,
                version: bsfiResult.version,
                domain_scores: {
                    CFS: bsfiResult.cfs_score,
                    ALS: bsfiResult.als_score, // Now includes Social/Relational load
                    SES: bsfiResult.ses_score,
                    RDS: bsfiResult.rds_score,
                    // New V7.3 Attribution Data
                    internal_driver_score: bsfiResult.internal_driver_score,
                    external_driver_score: bsfiResult.external_driver_score,
                },
                // Legacy support for boolean flag
                is_internal_driver: bsfiResult.internal_driver_score > 0.5,
                integration_pattern: integrationPattern,
                sensory_pattern: profile?.sensory_pattern || null,
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
